#!/usr/bin/env node
/**
 * build-page-motion.js — scroll-reveal motion on /ai-training/.
 *
 * Both reference sites reduce to one move. cytd.ai and neurex.webflow.io each
 * prime elements below the fold at opacity:0 with translateY(40px) and release
 * them on scroll; cytd runs it at 0.4s ease-out over Lenis smooth scroll,
 * neurex through Webflow's interaction engine. Same effect, different plumbing.
 *
 * This does it with an IntersectionObserver and two CSS classes. No library:
 * the page is a flattened export served as static HTML, and a scroll-hijacking
 * dependency is a lot of weight and risk for a fade.
 *
 * THREE THINGS THAT MATTER MORE THAN THE EFFECT
 *
 *   No-JS safety. The primed state is gated behind html.js-motion, which the
 *   inline script sets before paint. If the script never runs, nothing is ever
 *   hidden. Priming in the base CSS is how these effects blank a page when a
 *   script 404s.
 *
 *   The hero is excluded. It is above the fold and holds the LCP text; hiding
 *   it to fade it in would delay the largest paint on a page whose whole job
 *   is to catch paid traffic. Motion starts at the second section, which is
 *   where scrolling starts anyway.
 *
 *   prefers-reduced-motion is honoured, and not by shortening the animation:
 *   the primed state is dropped entirely, so those visitors get the page with
 *   no movement at all.
 *
 * Elements that are display:none are skipped: an observer never fires for
 * them, so priming one would leave it invisible for good if the page later
 * showed it. .how hides three paragraphs and draws their text with CSS
 * content: on pseudo-elements.
 *
 * Cards with their own :hover transform are not revealed individually, because
 * .is-in sets transform:none and would fight the lift on hover. Their grid is
 * revealed as one instead.
 *
 * Idempotent: replaces its own style and script blocks.
 *
 * Usage:  node scripts/build-page-motion.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PAGE = path.join(ROOT, "public", "ai-training", "index.html");

const STYLE = `<style id="motion-style">
        .js-motion .rv{opacity:0;transform:translateY(28px);will-change:opacity,transform}
        .js-motion .rv.is-in{opacity:1;transform:none;transition:opacity .62s cubic-bezier(.22,.61,.36,1),transform .62s cubic-bezier(.22,.61,.36,1)}
        @media(prefers-reduced-motion:reduce){
          .js-motion .rv,.js-motion .rv.is-in{opacity:1!important;transform:none!important;transition:none!important;will-change:auto!important}
        }
      </style>`;

const SCRIPT_TAG = `<script id="motion-js">
      (function(){
        var d=document, root=d.documentElement;
        if(!('IntersectionObserver' in window)) return;      // leave the page as-is
        root.className += ' js-motion';                       // prime only once JS is live

        function ready(fn){ d.readyState!=='loading' ? fn() : d.addEventListener('DOMContentLoaded',fn); }

        ready(function(){
          var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
          var groups = [
            ['.impact',            ':scope > *'],
            ['.how',               ':scope > *'],
            ['.program',           ':scope > .program-header, :scope > .program-intro, :scope > .program-cards, :scope > .community-feature, :scope > .program-closing'],
            ['.campaign-why',      '.why-banner, .why-reason, .why-people > li'],
            ['.campaign-reviews',  'h2, .cr-card, .cr-foot'],
            ['.faq',               ':scope > div'],
            ['.cta--compact',      ':scope > *'],
            ['.campaign-close',    '.cc-eyebrow, .cc-head, .cc-copy, .cc-btn']
          ];

          var io = new IntersectionObserver(function(entries){
            entries.forEach(function(en){
              if(!en.isIntersecting) return;
              en.target.classList.add('is-in');
              io.unobserve(en.target);                        // reveal once, never re-hide
            });
          }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

          groups.forEach(function(g){
            d.querySelectorAll(g[0]).forEach(function(section){
              var items = [].slice.call(section.querySelectorAll(g[1]))
                .filter(function(el){
                  if(el.tagName === 'STYLE' || el.tagName === 'SCRIPT') return false;
                  // An observer never fires for a display:none element, so priming
                  // one leaves it stuck at opacity 0 if the page ever shows it.
                  // .how hides three paragraphs and renders their text through
                  // CSS content: on pseudo-elements instead.
                  var cs = getComputedStyle(el);
                  return cs.display !== 'none' && cs.visibility !== 'hidden';
                });
              items.forEach(function(el, i){
                el.classList.add('rv');
                if(!reduce) el.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
                io.observe(el);
              });
            });
          });
        });
      })();
      </script>`;

let html = fs.readFileSync(PAGE, "utf8");

html = html.replace(/<style id="motion-style">[\s\S]*?<\/style>/, "");
html = html.replace(/<script id="motion-js">[\s\S]*?<\/script>/, "");

const headEnd = html.indexOf("</head>");
if (headEnd === -1) throw new Error("no </head> on the page");
html = html.slice(0, headEnd) + STYLE + html.slice(headEnd);

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd === -1) throw new Error("no </body> on the page");
html = html.slice(0, bodyEnd) + SCRIPT_TAG + html.slice(bodyEnd);

fs.writeFileSync(PAGE, html);
console.log("  motion: scroll reveals on 7 sections, hero excluded");
