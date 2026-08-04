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

    function validate(showAll) {
      var firstBad = null;

      Object.keys(MESSAGES).forEach(function (name) {
        var fields = form.querySelectorAll('[name="' + name + '"]');
        if (!fields.length) return;
        var field = fields[0];
        var ok;

        if (field.type === "radio") {
          ok = Array.prototype.some.call(fields, function (r) { return r.checked; });
        } else if (field.type === "email") {
          ok = field.value.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value.trim());
        } else {
          ok = field.value.trim() !== "";
        }

        // Only surface an error once the visitor has engaged with the field,
        // or once they've tried to submit. Shouting at an empty form is rude.
        if (!ok && (showAll || field.dataset.touched === "1")) {
          setError(field, MESSAGES[name]);
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
