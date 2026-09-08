/**
 * nav.js — the one navigation bar, in two skins.
 *
 * The site had drifted into two different navigations: a sticky white pill with
 * hover dropdowns on the main site, and a compact bar with a toggle panel on the
 * campaign page. Same links, same company, two interaction models. This is the
 * single definition, with the theme as the only variable.
 *
 * Structure is identical in both: .ch-bar > .ch-logo + .ch-toggle + .ch-panel.
 * The toggle opens the panel at every width, desktop included — that is the
 * campaign page's behaviour and it is now the site's.
 *
 * What the theme changes is colour and the shape of the bar:
 *
 *   campaign   transparent bar on the dark hero, white text
 *   aog        the sticky white pill the main site is designed around, dark text
 *
 * The AOG skin keeps the pill deliberately. "Identical to the sales page" means
 * the same menu behaviour, not the campaign page's dark styling imported onto a
 * light site.
 */

/** The links. One list, so the two skins cannot drift apart. */
const MENU = [
  ["About", [
    ["History", "/history/"],
    ["Purpose", "/purpose/"],
    ["People", "/people/"],
    ["Culture", "/culture/"],
    ["Offices", "/offices/"],
  ]],
  ["Divisions", [
    ["Ad On AI", "/ad-on-ai-division/"],
    ["Ad On Workforce", "/ad-on-workforce-division/"],
    ["Ad On Hold", "/ad-on-hold/"],
    ["Ad On Digital", "/ad-on-digital/"],
    ["Ad On SA", "/ad-on-sa/"],
  ]],
];

const TEL = "+61755861400";
const TEL_LABEL = "(07) 5586 1400";

const THEMES = {
  campaign: {
    panelId: "campaign-menu",
    navStyle: "position:relative;z-index:60;background:transparent",
    navAttrs: " data-campaign-header",
    css: `
        .ch-bar{max-width:1268px;margin:0 auto;padding:30px 24px 0;display:flex;align-items:center;justify-content:space-between;position:relative}
        .ch-logo{display:inline-flex;align-items:center;gap:11px;text-decoration:none}
        .ch-mark{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;flex:none}
        .ch-mark img{width:100%;height:100%;object-fit:contain;display:block}
        .ch-word{font-size:19px;font-weight:800;letter-spacing:-.02em;color:#fff;line-height:1}
        .ch-toggle{width:46px;height:46px;flex:none;display:inline-flex;align-items:center;justify-content:center;
          background:transparent;border:1px solid rgba(255,255,255,.30);border-radius:13px;cursor:pointer;padding:0;
          transition:background .18s ease,border-color .18s ease}
        .ch-toggle:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.5)}
        .ch-toggle:focus-visible{outline:2px solid #1BABE5;outline-offset:3px}
        .ch-bars{display:flex;flex-direction:column;justify-content:center;gap:4px;width:19px;height:13px}
        .ch-bars i{display:block;height:1.8px;background:#fff;border-radius:2px;transition:transform .22s ease,opacity .18s ease}
        .ch-panel{position:absolute;top:calc(100% + 12px);right:24px;z-index:70;min-width:270px;
          background:rgba(9,20,40,.97);backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);
          border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:20px 22px;
          box-shadow:0 28px 60px -22px rgba(0,0,0,.75);display:flex;flex-direction:column;gap:18px}
        .ch-label{margin:0 0 2px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10.5px;letter-spacing:.15em;text-transform:uppercase;color:#7fb2ff}
        .ch-group a{text-decoration:none;color:#e7eefb;font-size:15.5px;font-weight:600;line-height:1.25}
        .ch-group a:hover{color:#fff;text-decoration:underline;text-underline-offset:3px}
        .ch-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding-top:16px;border-top:1px solid rgba(255,255,255,.12)}
        .ch-tel{text-decoration:none;color:#9fb0c9;font-size:14.5px;font-weight:600;white-space:nowrap}
        .ch-tel:hover{color:#fff}
        .ch-contact{text-decoration:none;background:#1BABE5;color:#0B1220;font-weight:800;font-size:14.5px;
          padding:10px 18px;border-radius:999px;white-space:nowrap}
        .ch-contact:hover{filter:brightness(1.06)}
        @media(max-width:520px){ .ch-panel{right:24px;left:24px;min-width:0} }`,
  },

  aog: {
    panelId: "aog-menu",
    // Literally the campaign bar: relative, transparent, no pill. The only
    // things that differ are the values that HAVE to differ on a light ground —
    // the wordmark, the toggle and the bars invert to dark, and the panel is
    // light instead of navy. Geometry, spacing and behaviour are identical.
    // Sticky, unlike the campaign bar. That page is a single scroll with the
    // nav only relevant at the top; the main site has 2,000-word pages where
    // losing the menu halfway down is a real cost.
    // Sticky needs a backdrop. Measured with it transparent: body copy scrolls
    // straight through the 76px bar and collides with the logo. This is the
    // page's own colour at 72% with a blur behind it — the gradient still shows
    // through, so it reads as the same ground rather than a new panel.
    navStyle:
      "position:sticky;top:0;z-index:60;background:rgba(252,251,250,0.72);" +
      "backdrop-filter:blur(14px) saturate(150%);-webkit-backdrop-filter:blur(14px) saturate(150%);" +
      "border-bottom:1px solid rgba(11,18,32,0.06)",
    navAttrs: "",
    css: `
        .ch-bar{max-width:1268px;margin:0 auto;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;position:relative}
        .ch-logo{display:inline-flex;align-items:center;gap:11px;text-decoration:none}
        .ch-mark{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;flex:none}
        .ch-mark img{width:100%;height:100%;object-fit:contain;display:block}
        .ch-word{font-size:19px;font-weight:800;letter-spacing:-.02em;color:#0B1220;line-height:1;
          font-family:'Inter Tight','Helvetica Neue',Helvetica,Arial,sans-serif}
        .ch-toggle{width:46px;height:46px;flex:none;display:inline-flex;align-items:center;justify-content:center;
          background:transparent;border:1px solid rgba(11,18,32,.18);border-radius:13px;cursor:pointer;padding:0;
          transition:background .18s ease,border-color .18s ease}
        .ch-toggle:hover{background:rgba(11,18,32,.05);border-color:rgba(11,18,32,.34)}
        .ch-toggle:focus-visible{outline:2px solid #1BABE5;outline-offset:3px}
        .ch-bars{display:flex;flex-direction:column;justify-content:center;gap:4px;width:19px;height:13px}
        .ch-bars i{display:block;height:1.8px;background:#0B1220;border-radius:2px;transition:transform .22s ease,opacity .18s ease}
        .ch-panel{position:absolute;top:calc(100% + 12px);right:24px;z-index:70;min-width:270px;
          background:rgba(252,251,250,.97);backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);
          border:1px solid rgba(11,18,32,.10);border-radius:18px;padding:20px 22px;
          box-shadow:0 28px 60px -22px rgba(11,18,32,.28);display:flex;flex-direction:column;gap:18px}
        .ch-label{margin:0 0 2px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10.5px;letter-spacing:.15em;text-transform:uppercase;color:#1BABE5}
        .ch-group a{text-decoration:none;color:#0B1220;font-size:15.5px;font-weight:600;line-height:1.25}
        .ch-group a:hover{color:#1BABE5;text-decoration:underline;text-underline-offset:3px}
        .ch-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding-top:16px;border-top:1px solid rgba(11,18,32,.12)}
        .ch-tel{text-decoration:none;color:#5A6473;font-size:14.5px;font-weight:600;white-space:nowrap}
        .ch-tel:hover{color:#0B1220}
        .ch-contact{text-decoration:none;background:#0B1220;color:#fff;font-weight:800;font-size:14.5px;
          padding:10px 18px;border-radius:999px;white-space:nowrap}
        .ch-contact:hover{background:#18243a}
        @media(max-width:520px){ .ch-panel{right:24px;left:24px;min-width:0} }`,
  },
};

const SHARED_CSS = `
        .ch-panel[hidden]{display:none}
        .ch-group{display:flex;flex-direction:column;gap:9px}
        .ch-toggle[aria-expanded="true"] .ch-bars i:nth-child(1){transform:translateY(5.8px) rotate(45deg)}
        .ch-toggle[aria-expanded="true"] .ch-bars i:nth-child(2){opacity:0}
        .ch-toggle[aria-expanded="true"] .ch-bars i:nth-child(3){transform:translateY(-5.8px) rotate(-45deg)}
        @media(prefers-reduced-motion:reduce){ .ch-toggle,.ch-bars i{transition:none} }`;

const group = ([label, links]) => `
            <div class="ch-group">
              <p class="ch-label">${label}</p>
              ${links.map(([t, h]) => `<a href="${h}">${t}</a>`).join("\n              ")}
            </div>`;

/** The <nav> block, styles included, for the given theme. */
function navMarkup(themeName) {
  const t = THEMES[themeName];
  if (!t) throw new Error(`unknown nav theme: ${themeName}`);
  return `<nav data-aog-header${t.navAttrs} style="${t.navStyle}">
      <div class="ch-bar">
        <a class="ch-logo" href="/" aria-label="Ad On Group">
          <span class="ch-mark"><img src="/assets/design/adon-logo.png" alt="" width="320" height="320"></span>
          <span class="ch-word">Ad On Group</span>
        </a>
        <button class="ch-toggle" type="button" aria-expanded="false" aria-controls="${t.panelId}" aria-label="Open menu">
          <span class="ch-bars" aria-hidden="true"><i></i><i></i><i></i></span>
        </button>
        <div class="ch-panel" id="${t.panelId}" hidden>
          ${MENU.map(group).join("")}
          <div class="ch-actions">
            <a class="ch-tel" href="tel:${TEL}">${TEL_LABEL}</a>
            <a class="ch-contact" href="/contact-us/">Contact</a>
          </div>
        </div>
      </div>
      <style>${t.css}${SHARED_CSS}
      </style>
    </nav>`;
}

/**
 * The toggle script. Finds the panel through the button's aria-controls rather
 * than a hard-coded id, so one script serves both themes.
 */
const NAV_JS = `<script id="aog-header-js">
        (function(){
          var btn = document.querySelector('.ch-toggle');
          if(!btn) return;
          var panel = document.getElementById(btn.getAttribute('aria-controls'));
          if(!panel) return;

          function setOpen(open){
            panel.hidden = !open;
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
          }

          btn.addEventListener('click', function(e){
            e.stopPropagation();
            setOpen(panel.hidden);
          });

          // Anywhere outside closes it. The panel stops its own clicks so a
          // stray click inside does not shut it before a link is followed.
          panel.addEventListener('click', function(e){ e.stopPropagation(); });
          document.addEventListener('click', function(){ if(!panel.hidden) setOpen(false); });

          document.addEventListener('keydown', function(e){
            if(e.key === 'Escape' && !panel.hidden){ setOpen(false); btn.focus(); }
          });
        })();
        </script>`;

module.exports = { MENU, THEMES, navMarkup, NAV_JS };
