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

      fetch(form.getAttribute("action"), {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Bad response");
          form.reset();
          form.querySelectorAll("[data-error]").forEach(function (s) { s.textContent = ""; });
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
