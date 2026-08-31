/**
 * utm.js — remember which ad sent someone here.
 *
 * WHY THIS IS NOT JUST READ AT SUBMIT TIME
 * The ad points at /ai-training/, but the form lives on /ai-enquiry/. By the
 * time anyone submits, the URL no longer carries the campaign parameters — they
 * were on a page two clicks ago. Reading location.search in the form handler
 * would record nothing for every real visitor and only work if someone landed
 * directly on the form.
 *
 * So the parameters are captured on whatever page they first arrive at and kept
 * in sessionStorage for the rest of the visit.
 *
 * FIRST TOUCH WINS
 * A stored value is never replaced. Landing with parameters, browsing to a page
 * without them and coming back must not blank them out, which is the failure
 * this exists to prevent. It also means a second ad click inside the same tab
 * keeps the first campaign rather than the last one.
 *
 * Loaded on every page, because the landing page is rarely the form page.
 * sessionStorage, not localStorage: attribution belongs to this visit.
 */
(function () {
  "use strict";

  var KEY = "aog_attrib";
  var FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"];

  // Private browsing and a blocked-cookies setting both make sessionStorage
  // throw rather than return null, and a form that stops submitting because
  // analytics failed would be a far worse bug than losing the attribution.
  function read() {
    try {
      var raw = window.sessionStorage.getItem(KEY);
      var parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function write(value) {
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify(value));
    } catch (e) { /* nothing to do about it, and nothing worth breaking */ }
  }

  var stored = read();
  var params = new URLSearchParams(window.location.search);
  var changed = false;

  FIELDS.forEach(function (field) {
    var value = (params.get(field) || "").trim();
    if (!value || stored[field]) return;   // empty, or already held: leave it
    stored[field] = value.slice(0, 300);
    changed = true;
  });

  // The page the visit started on, which is the page the ad actually paid for.
  // The form's own URL is recorded separately as `page`.
  if (!stored.landing_page) {
    stored.landing_page = window.location.pathname;
    changed = true;
  }

  if (changed) write(stored);

  /**
   * Everything captured, as a flat object with an empty string for anything
   * missing — the sheet's columns have to line up whether or not a visitor
   * arrived from an ad.
   */
  window.aogAttribution = function () {
    var s = read();
    var out = {};
    FIELDS.concat(["landing_page"]).forEach(function (f) { out[f] = s[f] || ""; });
    return out;
  };
})();
