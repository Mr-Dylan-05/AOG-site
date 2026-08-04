/**
 * mobile-nav.js — make the header dropdowns work on touch.
 *
 * The design's dropdowns open on :hover only; the flatten dropped the runtime
 * that handled clicks. A phone has no hover, so every sub-page behind a
 * dropdown was unreachable from the header.
 *
 * Progressive enhancement: with JS off, nothing changes and the hub-page links
 * still work. Only runs below the mobile breakpoint, so desktop hover is
 * untouched.
 *
 * The trigger is a real link (e.g. /about-us/), so a plain tap would navigate
 * away before the menu could open. First tap opens the menu; a second tap on
 * the same trigger follows the link — the pattern users expect, and it keeps
 * the hub page reachable.
 */
(function () {
  "use strict";

  var MOBILE = "(max-width: 767px)";
  var OPEN = "nav-open";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var mq = window.matchMedia(MOBILE);
    var groups = [].slice.call(document.querySelectorAll(".nav-prog"));
    if (!groups.length) return;

    function closeAll(except) {
      groups.forEach(function (g) {
        if (g !== except) g.classList.remove(OPEN);
      });
    }

    groups.forEach(function (group) {
      var trigger = group.querySelector("a[href]");
      var menu = group.querySelector(".nav-menu");
      if (!trigger || !menu) return;

      trigger.addEventListener("click", function (e) {
        if (!mq.matches) return;                    // desktop keeps hover
        if (group.classList.contains(OPEN)) return; // second tap follows the link
        e.preventDefault();
        closeAll(group);
        group.classList.add(OPEN);
      });

      // Let assistive tech and keyboards report the state.
      trigger.setAttribute("aria-expanded", "false");
      var observer = new MutationObserver(function () {
        trigger.setAttribute("aria-expanded", group.classList.contains(OPEN) ? "true" : "false");
      });
      observer.observe(group, { attributes: true, attributeFilter: ["class"] });
    });

    // Tapping outside, or pressing Escape, closes any open menu.
    document.addEventListener("click", function (e) {
      if (!mq.matches) return;
      if (!e.target.closest(".nav-prog")) closeAll(null);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll(null);
    });

    // Leaving mobile width resets everything so desktop hover behaves normally.
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(
      function () { if (!mq.matches) closeAll(null); }
    );
  });
})();
