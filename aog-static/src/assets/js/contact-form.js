/**
 * contact-form.js — validation and submission for the contact form.
 *
 * Progressive enhancement. With JavaScript off, the form still posts normally
 * to whatever endpoint the build stamped in, and the service's own thank-you
 * page handles the response. With JavaScript on, the visitor gets inline
 * validation, a clear sending state, and a success message without losing the
 * page they were on.
 *
 * Deliberately no dependencies and no build step — this is the only script the
 * site loads besides the mobile nav, and it should stay that way.
 */
(function () {
  "use strict";

  /* What each form reports to Meta, keyed by its own data-form value.
     A form absent from here reports nothing.

     Only the enquiry form is a Lead. It asks for a name, an email, a phone
     number and what someone wants from AI, which is a person asking to be
     contacted. The quiz is a different thing: someone answering six questions
     to see their own result. Both are worth knowing about, but counting them
     as the same conversion would train ad delivery towards quiz takers, who
     are cheaper to acquire and further from buying. QuizComplete is a custom
     event so it can be watched, or optimised towards deliberately, without
     diluting Lead.

     Matched on data-form rather than the page path, so moving or duplicating a
     form cannot silently change what gets reported. Every form on the site
     carries a distinct value: enquiry, quiz, partner, referral, and the
     contact form which has none and falls back to "contact". */
  var PIXEL_EVENTS = {
    enquiry: { method: "track", name: "Lead" },
    quiz: { method: "trackCustom", name: "QuizComplete" },
  };

  /* The pixel is only initialised on the production hostname, so anywhere else
     is a developer looking at the site. */
  function isDev() {
    var h = window.location.hostname;
    return h !== "adongroup.com.au" && h !== "www.adongroup.com.au";
  }

  var MESSAGES = {
    firstName: "Please enter your first name.",
    lastName: "Please enter your last name.",
    email: "Please enter a valid email address.",
    phone: "Please enter a phone number we can reach you on.",
    message: "Please tell us how we can help.",
    contactPreference: "Please choose how you'd like us to get in touch.",
  };

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var form = document.querySelector("form[data-contact-form]");
    if (!form) return;

    // Hand validation over to this script.
    //
    // Without it the browser's own validation runs first on a form with
    // required fields, shows its native bubble, and cancels the submit event
    // before any listener here sees it — so the inline messages below never
    // appeared. Set at runtime rather than as an attribute in the markup: with
    // JavaScript off, the native validation is still the only thing standing
    // between an empty form and the endpoint, and it should stay.
    form.setAttribute("novalidate", "");

    // One event per page load no matter how many times the handler runs.
    // Double-clicking submit, or a browser replaying the event, must not
    // report two.
    var pixelReported = false;

    var status = form.querySelector("[data-form-status]");
    var button = form.querySelector('button[type="submit"]');
    var buttonText = button ? button.innerHTML : "";

    /** Show or clear the error for one field. */
    function setError(field, message) {
      var wrap = field.closest("label, fieldset") || field.parentElement;
      var slot = wrap.querySelector("[data-error]");
      if (!slot) {
        slot = document.createElement("span");
        slot.setAttribute("data-error", "");
        slot.className = "form-error";
        wrap.appendChild(slot);
      }
      slot.textContent = message || "";
      field.setAttribute("aria-invalid", message ? "true" : "false");
    }

    /**
     * The message for a field, in order of preference: the hand-written one
     * from MESSAGES, then one built from the field's own label.
     *
     * The hand-written map covers the contact form. The partner and referral
     * forms carry a different set of names, and writing a bespoke line for
     * every one of them would mean this file had to be edited each time a form
     * gained a field. Deriving from the label keeps it general and keeps the
     * wording in the markup, next to the field it belongs to.
     */
    function messageFor(field, name) {
      if (MESSAGES[name]) return MESSAGES[name];
      if (field.type === "checkbox") return "Please tick this to continue.";
      if (field.type === "email") return "Please enter a valid email address.";
      var wrap = field.closest("label, fieldset");
      var label = wrap && wrap.querySelector("span, legend");
      var text = label ? (label.textContent || "").trim() : "";
      // "<Label> is required" rather than "Please enter your <label>": the
      // labels vary too much for a possessive to stay grammatical. On the
      // referral form "Contact name" is the person being referred, not the
      // partner's own, so "your contact name" would be actively wrong.
      return text ? text + " is required." : "Please complete this field.";
    }

    /** Every field the form actually requires, one entry per name. */
    function requiredFields() {
      var seen = {};
      var out = [];
      Array.prototype.forEach.call(form.querySelectorAll("[required]"), function (f) {
        if (!f.name || seen[f.name]) return;
        // a hidden conditional block is not being asked for
        if (f.closest("[hidden]")) return;
        seen[f.name] = true;
        out.push(f.name);
      });
      return out;
    }

    function validate(showAll) {
      var firstBad = null;

      requiredFields().forEach(function (name) {
        var fields = form.querySelectorAll('[name="' + name + '"]');
        if (!fields.length) return;
        var field = fields[0];
        var ok;

        if (field.type === "radio") {
          ok = Array.prototype.some.call(fields, function (r) { return r.checked; });
        } else if (field.type === "checkbox") {
          ok = field.checked;
        } else if (field.type === "email") {
          ok = field.value.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value.trim());
        } else {
          ok = field.value.trim() !== "";
        }

        // Only surface an error once the visitor has engaged with the field,
        // or once they've tried to submit. Shouting at an empty form is rude.
        if (!ok && (showAll || field.dataset.touched === "1")) {
          setError(field, messageFor(field, name));
          if (!firstBad) firstBad = field;
        } else if (ok) {
          setError(field, "");
        }
      });

      return firstBad;
    }

    // Mark fields as touched so errors appear after interaction, not before.
    form.addEventListener("blur", function (e) {
      if (e.target.name) { e.target.dataset.touched = "1"; validate(false); }
    }, true);
    form.addEventListener("input", function (e) {
      if (e.target.dataset.touched === "1") validate(false);
    });

    form.addEventListener("submit", function (e) {
      var firstBad = validate(true);
      if (firstBad) {
        e.preventDefault();
        firstBad.focus();
        if (status) {
          status.textContent = "Please check the highlighted fields.";
          status.className = "form-status form-status--error";
        }
        return;
      }

      // No endpoint configured yet — the build leaves the form inert rather
      // than posting nowhere and pretending it worked.
      if (!form.getAttribute("action")) {
        e.preventDefault();
        if (status) {
          status.textContent = "This form isn't connected yet. Please call (07) 5586 1400 or email info@adongroup.com.au.";
          status.className = "form-status form-status--error";
        }
        return;
      }

      // Netlify handles its own posting; let the browser do it normally.
      if (form.hasAttribute("data-netlify")) return;

      e.preventDefault();
      if (button) { button.disabled = true; button.innerHTML = "Sending…"; }
      if (status) { status.textContent = ""; status.className = "form-status"; }

      // Sent url-encoded rather than as a raw FormData object. FormData makes
      // the browser send multipart/form-data, which a serverless function
      // cannot read without a parser library; url-encoded is parsed natively,
      // and every hosted form service accepts it too.
      var payload = new URLSearchParams(new FormData(form));
      // Which form this is, added here rather than as a hidden input in every
      // form's markup. /api/lead uses it to choose the sheet tab, so a new form
      // is separated correctly the moment it carries a data-form attribute.
      payload.set("form", form.getAttribute("data-form") || "contact");
      payload.set("page", window.location.pathname + window.location.search);

      // Campaign parameters captured by utm.js when the visitor first arrived,
      // which is normally a different page to this one. Every key is set even
      // when empty so the sheet's columns stay aligned across submissions.
      var attribution =
        typeof window.aogAttribution === "function" ? window.aogAttribution() : {};
      Object.keys(attribution).forEach(function (key) {
        payload.set(key, attribution[key]);
      });

      // submitted_at is deliberately not sent. /api/lead stamps it server-side
      // from a clock we control; a value posted from the browser would overwrite
      // that with whatever the visitor's device thinks the time is.

      if (isDev()) {
        console.log("[aog] attribution captured:", attribution);
        console.log("[aog] posting to", form.getAttribute("action"),
                    Object.fromEntries(payload));
      }

      fetch(form.getAttribute("action"), {
        method: "POST",
        body: payload,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Bad response");
          form.reset();
          form.querySelectorAll("[data-error]").forEach(function (s) { s.textContent = ""; });

          // Tell analytics a lead came in. The landing page is the destination
          // of paid traffic, so without this there is no way to tell which ads
          // produced enquiries and which only produced clicks.
          if (typeof window.gtag === "function") {
            window.gtag("event", "generate_lead", {
              form_id: form.getAttribute("data-form") || "contact",
              page_location: window.location.pathname,
            });
          }

          // Meta's equivalent, for the paid campaigns.
          //
          // This sits inside the .then of a response that was checked for
          // res.ok, so it reports only a submission the Sheet actually
          // accepted. A validation failure, a dead endpoint or a 502 from
          // /api/lead all return before reaching here.
          var formKey = form.getAttribute("data-form") || "contact";
          // hasOwnProperty, so a form named "constructor" or "toString" reads
          // as absent rather than picking up something off Object.prototype.
          var pixel = Object.prototype.hasOwnProperty.call(PIXEL_EVENTS, formKey)
            ? PIXEL_EVENTS[formKey] : null;
          if (!pixelReported && pixel && typeof window.fbq === "function") {
            pixelReported = true;
            window.fbq(pixel.method, pixel.name, { content_name: formKey });
          }

          // The curriculum download belongs to the person who asked for it.
          // Everyone else gets the panel without it — the interest field is
          // already carrying which button brought them here.
          //
          // style.display rather than the hidden attribute: the button is
          // inline-flex inline, and an inline declaration beats the UA rule
          // that [hidden] relies on. That is the same thing that left the
          // submitted form sitting on screen for weeks.
          var wanted = form.querySelector('[name="interest"]');
          var wantedCurriculum = wanted && wanted.value.trim() === "curriculum";
          var downloads = document.querySelectorAll("[data-curriculum]");
          for (var d = 0; d < downloads.length; d++) {
            if (!wantedCurriculum) downloads[d].style.display = "none";
          }

          // A form can name a panel to show in its place. Leaving a filled-in
          // form on screen under a success line reads as though it might not
          // have sent; swapping it for a plain confirmation does not.
          var panelSel = form.getAttribute("data-success-panel");
          var panel = panelSel && document.querySelector(panelSel);
          if (panel) {
            form.hidden = true;
            panel.hidden = false;
            if (typeof panel.scrollIntoView === "function") {
              panel.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
          }

          if (status) {
            status.textContent = "Thanks — we've got your enquiry and will be in touch shortly.";
            status.className = "form-status form-status--ok";
          }
          if (button) button.innerHTML = "Sent";
        })
        .catch(function () {
          if (status) {
            status.textContent = "Something went wrong sending that. Please call (07) 5586 1400 or email info@adongroup.com.au.";
            status.className = "form-status form-status--error";
          }
          if (button) { button.disabled = false; button.innerHTML = buttonText; }
        });
    });
  });
})();

/**
 * The booking option on the thank-you panel.
 *
 * Deliberately not a conversion. The Lead has already been reported by the
 * submission that revealed this panel; firing anything here would count the
 * same person twice and teach Meta to optimise for people who click a second
 * button. Booking is an extra, not the goal.
 *
 * The widget is fetched on the first click rather than on page load. Most
 * visitors never reach the thank-you panel, and of those who do most will not
 * book, so loading Calendly's script and stylesheet up front would put a
 * third-party request on every form page to serve a minority. Nothing external
 * is contacted until someone asks for it.
 *
 * The button only exists when thirdParty.calendly is set — see .eleventy.js.
 */
(function () {
  "use strict";

  var WIDGET = "https://assets.calendly.com/assets/external/widget.js";
  var STYLES = "https://assets.calendly.com/assets/external/widget.css";
  var pending = null;

  function loadWidget() {
    if (pending) return pending;
    pending = new Promise(function (resolve, reject) {
      var css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = STYLES;
      document.head.appendChild(css);

      var js = document.createElement("script");
      js.src = WIDGET;
      js.async = true;
      js.onload = resolve;
      js.onerror = reject;
      document.head.appendChild(js);
    });
    return pending;
  }

  document.addEventListener("click", function (e) {
    var button = e.target.closest && e.target.closest("[data-calendly]");
    if (!button) return;
    var url = button.getAttribute("data-calendly");
    if (!url) return;

    e.preventDefault();
    var label = button.innerHTML;
    button.disabled = true;
    button.innerHTML = "Opening…";

    loadWidget()
      .then(function () {
        button.disabled = false;
        button.innerHTML = label;
        if (window.Calendly) window.Calendly.initPopupWidget({ url: url });
        else window.open(url, "_blank", "noopener");
      })
      .catch(function () {
        // A blocked or failed third-party script must not cost someone the
        // booking: the link still opens, just in a tab instead of a modal.
        button.disabled = false;
        button.innerHTML = label;
        window.open(url, "_blank", "noopener");
      });
  });
})();

/**
 * What they came for.
 *
 * Every CTA on the sales page scrolls to the same form, so by the time someone
 * submits there is nothing left saying which button sent them. A CTA can now
 * declare its intent, and the form records it — one lead, one row, one extra
 * column, rather than a second form that would split the same person in two.
 *
 * The confirmation email reads it to decide whether it is answering "send me
 * the curriculum" or "have a chat with me". Anything without a data-intent
 * leaves it empty, which is the ordinary enquiry.
 */
(function () {
  "use strict";

  document.addEventListener("click", function (e) {
    var cta = e.target.closest && e.target.closest("[data-intent]");
    if (!cta) return;
    var value = (cta.getAttribute("data-intent") || "").trim();
    if (!value) return;
    var fields = document.querySelectorAll('form[data-contact-form] [name="interest"]');
    for (var i = 0; i < fields.length; i++) fields[i].value = value;
  });
})();
