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

  /* Which forms count as a Meta conversion. The booking form on /ai-enquiry/
     is the destination of the paid campaign, so it is the only one Meta should
     optimise towards — counting the quiz or a partner referral as the same
     event would train the ad delivery on the wrong people. */
  var LEAD_FORMS = ["enquiry"];

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

    // A Lead is one conversion no matter how many times the handler runs.
    // Double-clicking submit, or a browser replaying the event, must not
    // report two.
    var leadReported = false;

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
          if (!leadReported && LEAD_FORMS.indexOf(formKey) !== -1 &&
              typeof window.fbq === "function") {
            leadReported = true;
            window.fbq("track", "Lead", { content_name: formKey });
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
