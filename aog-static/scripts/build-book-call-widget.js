#!/usr/bin/env node

/**
 * Adds the floating /ai-training/ booking prompt to the flattened campaign
 * page. The campaign page is a passthrough file, so this generator owns one
 * clearly marked block and can be rerun safely after other campaign builders.
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const PAGE = path.join(ROOT, "public", "ai-training", "index.html");
const SITE = path.join(ROOT, "src", "_data", "site.json");
const START = "<!-- AOG_BOOK_CALL_WIDGET_START -->";
const END = "<!-- AOG_BOOK_CALL_WIDGET_END -->";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/\"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function stripOwnedBlock(html) {
  const start = html.indexOf(START);
  if (start === -1) return html;
  const end = html.indexOf(END, start);
  if (end === -1) {
    throw new Error("Found the booking-widget start marker without its end marker.");
  }
  return html.slice(0, start) + html.slice(end + END.length).replace(/^\s*/, "");
}

const site = JSON.parse(fs.readFileSync(SITE, "utf8"));
const calendarUrl = String(site.thirdParty && site.thirdParty.calendly || "").trim();
let html = stripOwnedBlock(fs.readFileSync(PAGE, "utf8"));

if (!calendarUrl) {
  fs.writeFileSync(PAGE, html);
  console.log("Removed the booking prompt because no Calendly URL is configured.");
  process.exit(0);
}

const safeCalendarUrl = escapeHtml(calendarUrl);
const block = `${START}
<div class="aog-bcw" data-aog-book-call data-state="pill" data-calendar-url="${safeCalendarUrl}">
  <button class="aog-bcw__pill aog-bcw__layer" type="button" data-bcw-pill aria-haspopup="dialog" aria-controls="aog-book-call-card">
    <span class="aog-bcw__pill-avatar" aria-hidden="true">
      <span class="aog-bcw__avatar-crop"><img src="/assets/design/team-paul.png" alt="" width="41" height="41"></span>
      <span class="aog-bcw__online"></span>
    </span>
    <span>Book a call</span>
  </button>

  <section class="aog-bcw__card aog-bcw__layer" id="aog-book-call-card" data-bcw-card role="dialog" aria-modal="false" aria-labelledby="aog-book-call-title" hidden>
    <button class="aog-bcw__close" type="button" data-bcw-close aria-label="Close booking invitation">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"></path></svg>
    </button>
    <div class="aog-bcw__person">
      <span class="aog-bcw__person-avatar">
        <span class="aog-bcw__avatar-crop"><img src="/assets/design/team-paul.png" alt="Paul Harding from Ad On Group" width="64" height="64"></span>
        <span class="aog-bcw__online" aria-hidden="true"></span>
      </span>
      <span class="aog-bcw__person-copy">
        <span class="aog-bcw__title" id="aog-book-call-title" data-bcw-card-title>Speak with one of our AI training facilitators</span>
      </span>
    </div>
    <p class="aog-bcw__body" data-bcw-card-body>See where practical AI could save your team time.</p>
    <a class="aog-bcw__cta" data-bcw-open href="${safeCalendarUrl}" target="_blank" rel="noopener">Book a discovery call</a>
  </section>

  <section class="aog-bcw__schedule aog-bcw__layer" id="aog-book-call-schedule" data-bcw-schedule role="dialog" aria-modal="false" aria-labelledby="aog-book-call-schedule-title" hidden>
    <header class="aog-bcw__schedule-head">
      <span class="aog-bcw__schedule-avatar" aria-hidden="true"><span class="aog-bcw__avatar-crop"><img src="/assets/design/team-paul.png" alt="" width="40" height="40"></span></span>
      <span class="aog-bcw__schedule-copy">
        <span class="aog-bcw__schedule-title" id="aog-book-call-schedule-title">Book your discovery call</span>
        <span class="aog-bcw__schedule-subtitle">Pick a time that works for you</span>
      </span>
      <button class="aog-bcw__close aog-bcw__schedule-close" type="button" data-bcw-close aria-label="Close scheduler">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"></path></svg>
      </button>
    </header>
    <div class="aog-bcw__schedule-body">
      <div class="aog-bcw__loading" data-bcw-loading role="status">Loading available times…</div>
      <div class="aog-bcw__calendar" data-bcw-calendar></div>
      <div class="aog-bcw__error" data-bcw-error role="alert" hidden>
        <strong>The calendar couldn’t load.</strong>
        <span>You can still choose a time directly in Calendly.</span>
        <a href="${safeCalendarUrl}" target="_blank" rel="noopener">Open Calendly</a>
      </div>
    </div>
  </section>
</div>

<style id="aog-book-call-widget-styles">
  .aog-bcw,
  .aog-bcw *{box-sizing:border-box}
  .aog-bcw{
    position:fixed;
    right:max(20px,env(safe-area-inset-right));
    bottom:max(20px,env(safe-area-inset-bottom));
    z-index:900;
    color:#172632;
    font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    line-height:1.35;
  }
  .aog-bcw [hidden]{display:none!important}
  .aog-bcw button,.aog-bcw a{font:inherit}
  /* The reset above outranks the .aog-bcw__pill and .aog-bcw__cta rules, so their own
     font-size and font-weight never apply and both render at 16px regular. The size is
     set here, a step more specific; the weight is left as it renders. */
  .aog-bcw .aog-bcw__pill,.aog-bcw .aog-bcw__cta{font-size:18.5px}
  .aog-bcw__layer:not([hidden]){animation:aog-bcw-in 240ms cubic-bezier(.22,1,.36,1) both}
  .aog-bcw__layer.is-leaving{animation:aog-bcw-out 160ms cubic-bezier(.4,0,1,1) both}
  @keyframes aog-bcw-in{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes aog-bcw-out{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(8px) scale(.985)}}
  .aog-bcw__pill{
    min-width:177px;
    min-height:55px;
    margin:0;
    padding:7px 20px 7px 8px;
    border:1px solid rgba(23,38,50,.08);
    border-radius:999px;
    background:#fff;
    color:#172632;
    display:flex;
    align-items:center;
    gap:12px;
    cursor:pointer;
    font-size:15px;
    font-weight:750;
    letter-spacing:-.01em;
    box-shadow:0 16px 48px rgba(16,38,54,.22),0 3px 12px rgba(16,38,54,.12);
    -webkit-tap-highlight-color:transparent;
  }
  .aog-bcw__pill:hover{transform:translateY(-1px);box-shadow:0 19px 54px rgba(16,38,54,.26),0 4px 14px rgba(16,38,54,.13)}
  .aog-bcw__pill:focus-visible,.aog-bcw__close:focus-visible,.aog-bcw__cta:focus-visible,.aog-bcw__error a:focus-visible{outline:3px solid rgba(27,171,229,.42);outline-offset:3px}
  .aog-bcw__pill-avatar{position:relative;display:block;flex:0 0 41px;width:41px;height:41px}
  .aog-bcw__avatar-crop{position:absolute;inset:0;display:block;overflow:hidden;border-radius:50%;background:#e8edf0}
  .aog-bcw__avatar-crop img{position:absolute;inset:0;display:block;width:100%;height:100%;max-width:none;object-fit:cover;object-position:center}
  .aog-bcw__online{position:absolute;right:-1px;bottom:0;width:13px;height:13px;border:2px solid #fff;border-radius:50%;background:#2ac769;box-shadow:0 0 0 1px rgba(18,104,51,.08)}
  .aog-bcw__card{
    position:relative;
    width:428px;
    padding:25px;
    border:1px solid rgba(23,38,50,.08);
    border-radius:25px;
    background:#fff;
    box-shadow:0 24px 70px rgba(16,38,54,.25),0 4px 18px rgba(16,38,54,.11);
  }
  .aog-bcw__close{
    width:44px;
    height:44px;
    min-height:44px;
    margin:0;
    padding:0;
    border:0;
    border-radius:50%;
    background:transparent;
    color:#61707a;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
  }
  .aog-bcw__card>.aog-bcw__close{position:absolute;right:11px;top:11px;width:50px;height:50px;min-height:50px}
  .aog-bcw__card>.aog-bcw__close svg{width:24px;height:24px}
  .aog-bcw__close:hover{background:#f1f5f7;color:#172632}
  .aog-bcw__close svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-width:1.8}
  .aog-bcw__person{display:flex;align-items:center;gap:15px;padding-right:43px}
  .aog-bcw__person-avatar{position:relative;display:block;flex:0 0 64px;width:64px;height:64px}
  .aog-bcw__person-avatar .aog-bcw__online{right:0;bottom:1px;width:15px;height:15px}
  .aog-bcw__person-copy{min-width:0;display:flex;flex-direction:column;gap:4px}
  .aog-bcw__title{display:block;color:#172632;font-size:22px;font-weight:800;line-height:1.18;letter-spacing:-.025em}
  .aog-bcw__body{margin:20px 0;color:#53636e;font-size:17px;line-height:1.52}
  .aog-bcw__cta{
    width:100%;
    min-height:64px;
    padding:14px 23px;
    border-radius:18px;
    background:#172632;
    color:#fff!important;
    display:flex;
    align-items:center;
    justify-content:center;
    text-align:center;
    text-decoration:none!important;
    font-size:17px;
    font-weight:800;
    line-height:1.2;
    transition:transform 150ms ease,background 150ms ease;
  }
  .aog-bcw__cta:hover{background:#0c1a23;transform:translateY(-1px)}
  .aog-bcw__schedule{
    width:420px;
    height:min(720px,calc(100dvh - 40px));
    min-height:500px;
    overflow:hidden;
    border:1px solid rgba(23,38,50,.08);
    border-radius:22px;
    background:#fff;
    box-shadow:0 24px 70px rgba(16,38,54,.28),0 4px 18px rgba(16,38,54,.12);
    display:flex;
    flex-direction:column;
  }
  .aog-bcw__schedule-head{position:relative;flex:0 0 auto;min-height:78px;padding:15px 58px 14px 17px;border-bottom:1px solid #e8edf0;background:#fff;display:flex;align-items:center;gap:11px}
  .aog-bcw__schedule-avatar{position:relative;display:block;flex:0 0 40px;width:40px;height:40px}
  .aog-bcw__schedule-copy{min-width:0;display:flex;flex-direction:column;gap:2px}
  .aog-bcw__schedule-title{color:#172632;font-size:15px;font-weight:800;letter-spacing:-.015em}
  .aog-bcw__schedule-subtitle{color:#6c7982;font-size:12px;font-weight:550}
  .aog-bcw__schedule-close{position:absolute;right:8px;top:17px}
  .aog-bcw__schedule-body{position:relative;min-height:0;flex:1;background:#fff}
  .aog-bcw__loading{position:absolute;z-index:2;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;color:#61707a;font-size:14px;font-weight:650;text-align:center}
  .aog-bcw__loading:before{content:"";width:18px;height:18px;margin-right:10px;border:2px solid #d8e0e5;border-top-color:#1babe5;border-radius:50%;animation:aog-bcw-spin .75s linear infinite}
  @keyframes aog-bcw-spin{to{transform:rotate(360deg)}}
  .aog-bcw__calendar{position:absolute;z-index:1;inset:0;overflow:hidden;background:#fff}
  .aog-bcw__calendar:empty{pointer-events:none}
  .aog-bcw__calendar iframe{display:block!important;width:100%!important;height:100%!important;min-width:0!important;border:0!important}
  .aog-bcw__error{position:absolute;z-index:3;inset:0;padding:34px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#53636e;text-align:center}
  .aog-bcw__error strong{color:#172632;font-size:17px}
  .aog-bcw__error span{font-size:14px;line-height:1.5}
  .aog-bcw__error a{margin-top:7px;padding:12px 18px;border-radius:12px;background:#172632;color:#fff!important;font-size:15px;font-weight:800;text-decoration:none!important}
  @media(max-width:860px){body.aog-bcw-enabled .ch-book{display:none!important}}
  @media(max-width:680px){
    .aog-bcw{right:max(12px,env(safe-area-inset-right));bottom:max(12px,env(safe-area-inset-bottom))}
    .aog-bcw__card{width:calc(100vw - 24px);padding:21px;border-radius:21px}
    .aog-bcw__title{font-size:19.5px}
    .aog-bcw__body{margin:17px 0;font-size:16px}
    .aog-bcw__cta{min-height:60px;border-radius:16px;font-size:16px}
  }
  @media(max-width:680px),(max-height:600px){
    .aog-bcw__schedule{position:fixed;inset:0;width:100vw;height:100dvh;min-height:0;max-height:none;border:0;border-radius:0;box-shadow:none}
    .aog-bcw__schedule-head{padding-top:max(15px,env(safe-area-inset-top));padding-left:max(17px,env(safe-area-inset-left));padding-right:max(58px,env(safe-area-inset-right));min-height:calc(78px + env(safe-area-inset-top))}
    .aog-bcw__schedule-close{top:max(17px,env(safe-area-inset-top));right:max(8px,env(safe-area-inset-right))}
    .aog-bcw__schedule-body{padding-bottom:env(safe-area-inset-bottom)}
  }
  @media(max-width:360px){.aog-bcw__card{padding:18px}.aog-bcw__person{gap:12px}.aog-bcw__person-avatar{width:57px;height:57px;flex-basis:57px}.aog-bcw__body{line-height:1.45}}
  @media(prefers-reduced-motion:reduce){
    .aog-bcw__layer:not([hidden]),.aog-bcw__layer.is-leaving,.aog-bcw__loading:before{animation-duration:.01ms!important;animation-iteration-count:1!important}
    .aog-bcw__pill,.aog-bcw__cta{transition:none!important}
  }
</style>

<script id="aog-book-call-widget-script">
(function(){
  "use strict";

  var root=document.querySelector("[data-aog-book-call]");
  if(!root||root.dataset.ready==="1")return;
  root.dataset.ready="1";

  var pill=root.querySelector("[data-bcw-pill]");
  var card=root.querySelector("[data-bcw-card]");
  var schedule=root.querySelector("[data-bcw-schedule]");
  var cardTitle=root.querySelector("[data-bcw-card-title]");
  var cardBody=root.querySelector("[data-bcw-card-body]");
  var openLink=root.querySelector("[data-bcw-open]");
  var calendar=root.querySelector("[data-bcw-calendar]");
  var loading=root.querySelector("[data-bcw-loading]");
  var error=root.querySelector("[data-bcw-error]");
  var calendarUrl=root.getAttribute("data-calendar-url")||"";
  var main=document.querySelector("main");
  var current="pill";
  var transitionTimer=0;
  var autoTimer=0;
  var calendarToken=0;
  var mainHadInert=false;
  var previousOverflow="";
  var sheetLocked=false;
  var lastTrigger="direct";
  var trackedLoaded=false;
  var reduceMotion=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var sheetQuery=window.matchMedia&&window.matchMedia("(max-width: 680px), (max-height: 600px)");
  var keys={auto:"aog:training-call-auto-opened",dismissed:"aog:training-call-dismissed",booked:"aog:training-call-booked"};
  var layers={pill:pill,card:card,schedule:schedule};

  function storageGet(key){try{return window.sessionStorage.getItem(key)}catch(_){return null}}
  function storageSet(key,value){try{window.sessionStorage.setItem(key,value)}catch(_){}}
  function layout(){return sheetQuery&&sheetQuery.matches?"sheet":"panel"}
  function track(name,extra){
    var detail=extra||{};
    var event={event:"book_call_widget_"+name,book_call_trigger:detail.trigger||lastTrigger,book_call_layout:layout(),page_path:window.location.pathname};
    if(window.dataLayer&&typeof window.dataLayer.push==="function")window.dataLayer.push(event);
  }
  function isModified(e){return e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey}
  function focusSoon(node){window.setTimeout(function(){if(node&&!node.hidden&&typeof node.focus==="function")node.focus({preventScroll:true})},reduceMotion?0:170)}
  function setBookedCopy(){
    if(storageGet(keys.booked)!=="1")return;
    cardTitle.textContent="You’re booked";
    cardBody.textContent="Check your inbox for the calendar invite. Talk soon.";
    openLink.hidden=true;
  }
  function syncModal(){
    var isSheet=current==="schedule"&&layout()==="sheet";
    schedule.setAttribute("aria-modal",isSheet?"true":"false");
    if(isSheet&&!sheetLocked){
      sheetLocked=true;
      previousOverflow=document.body.style.overflow;
      document.body.classList.add("aog-bcw-sheet-open");
      document.body.style.overflow="hidden";
      if(main){mainHadInert=main.hasAttribute("inert");main.setAttribute("inert","")}
    }else if(!isSheet&&sheetLocked){
      sheetLocked=false;
      document.body.classList.remove("aog-bcw-sheet-open");
      document.body.style.overflow=previousOverflow;
      if(main&&!mainHadInert)main.removeAttribute("inert");
    }
  }
  function changeState(next,options){
    options=options||{};
    if(!layers[next]||next===current)return;
    window.clearTimeout(transitionTimer);
    var from=layers[current];
    var to=layers[next];
    var finish=function(){
      from.classList.remove("is-leaving");
      from.hidden=true;
      to.hidden=false;
      current=next;
      root.setAttribute("data-state",next);
      syncModal();
      if(options.focus)focusSoon(options.focus);
      if(typeof options.after==="function")options.after();
    };
    from.classList.add("is-leaving");
    transitionTimer=window.setTimeout(finish,reduceMotion?0:160);
  }
  function dismiss(returnFocus){
    if(current==="pill")return;
    storageSet(keys.dismissed,"1");
    window.clearTimeout(autoTimer);
    calendarToken+=1;
    if(calendar)calendar.innerHTML="";
    track("dismissed");
    changeState("pill",{focus:returnFocus?pill:null});
  }
  function ensurePreconnect(){
    ["https://assets.calendly.com","https://calendly.com"].forEach(function(href){
      if(document.querySelector('link[rel="preconnect"][href="'+href+'"]'))return;
      var link=document.createElement("link");link.rel="preconnect";link.href=href;document.head.appendChild(link);
    });
  }
  function loadCalendly(){
    if(window.Calendly)return Promise.resolve(window.Calendly);
    if(window.__aogCalendlyWidgetPromise)return window.__aogCalendlyWidgetPromise;
    window.__aogCalendlyWidgetPromise=new Promise(function(resolve,reject){
      var cssHref="https://assets.calendly.com/assets/external/widget.css";
      var scriptSrc="https://assets.calendly.com/assets/external/widget.js";
      if(!document.querySelector('link[href="'+cssHref+'"]')){
        var css=document.createElement("link");css.rel="stylesheet";css.href=cssHref;document.head.appendChild(css);
      }
      var done=false;
      function finish(ok){if(done)return;done=true;window.clearTimeout(timeout);ok&&window.Calendly?resolve(window.Calendly):reject(new Error("Calendly did not load"))}
      var script=document.querySelector('script[src="'+scriptSrc+'"]');
      if(!script){script=document.createElement("script");script.src=scriptSrc;script.async=true;document.head.appendChild(script)}
      script.addEventListener("load",function(){finish(true)},{once:true});
      script.addEventListener("error",function(){finish(false)},{once:true});
      var timeout=window.setTimeout(function(){finish(Boolean(window.Calendly))},12000);
      if(window.Calendly)finish(true);
    });
    return window.__aogCalendlyWidgetPromise;
  }
  function calendlyUrl(){
    try{
      var url=new URL(calendarUrl,window.location.href);
      url.searchParams.set("hide_gdpr_banner","1");
      url.searchParams.set("primary_color","1babe5");
      if(layout()==="sheet")url.searchParams.set("hide_event_type_details","1");
      return url.toString();
    }catch(_){return calendarUrl}
  }
  function preload(){ensurePreconnect();loadCalendly().catch(function(){})}
  function showCard(trigger,focus){
    lastTrigger=trigger||"pill";
    setBookedCopy();
    preload();
    track("opened",{trigger:lastTrigger});
    changeState("card",{focus:focus?card.querySelector("[data-bcw-close]"):null});
  }
  function openScheduler(){
    lastTrigger="cta";
    calendarToken+=1;
    var token=calendarToken;
    loading.hidden=false;
    error.hidden=true;
    calendar.innerHTML="";
    track("scheduler_opened",{trigger:"cta"});
    changeState("schedule",{focus:schedule.querySelector("[data-bcw-close]"),after:function(){
      loadCalendly().then(function(api){
        if(token!==calendarToken||current!=="schedule")return;
        api.initInlineWidget({url:calendlyUrl(),parentElement:calendar});
        loading.hidden=true;
      }).catch(function(){
        if(token!==calendarToken||current!=="schedule")return;
        loading.hidden=true;
        error.hidden=false;
        track("load_failed",{trigger:"cta"});
      });
    }});
  }
  function trapFocus(e){
    if(e.key!=="Tab"||current!=="schedule"||layout()!=="sheet")return;
    var nodes=schedule.querySelectorAll('button:not([disabled]),a[href]:not([hidden]),iframe,[tabindex]:not([tabindex="-1"])');
    var list=Array.prototype.filter.call(nodes,function(node){return !node.hidden&&node.offsetParent!==null});
    if(!list.length){e.preventDefault();return}
    var first=list[0],last=list[list.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }

  document.body.classList.add("aog-bcw-enabled");
  setBookedCopy();
  track("shown",{trigger:"page"});

  pill.addEventListener("click",function(){showCard("pill",true)});
  root.querySelectorAll("[data-bcw-close]").forEach(function(button){button.addEventListener("click",function(){dismiss(true)})});
  openLink.addEventListener("click",function(e){
    window.clearTimeout(autoTimer);
    if(isModified(e))return;
    e.preventDefault();
    openScheduler();
  });
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape"&&current!=="pill"){e.preventDefault();dismiss(true);return}
    trapFocus(e);
  });
  document.addEventListener("click",function(e){
    if(!e.target.closest)return;
    var other=e.target.closest("[data-calendly]");
    if(!other||root.contains(other))return;
    window.clearTimeout(autoTimer);
    storageSet(keys.dismissed,"1");
    if(current!=="pill")dismiss(false);
  },true);
  if(sheetQuery){
    var onLayoutChange=function(){syncModal()};
    if(typeof sheetQuery.addEventListener==="function")sheetQuery.addEventListener("change",onLayoutChange);
    else if(typeof sheetQuery.addListener==="function")sheetQuery.addListener(onLayoutChange);
  }
  window.addEventListener("message",function(e){
    if(e.origin!=="https://calendly.com"||!e.data||typeof e.data.event!=="string")return;
    if((e.data.event==="calendly.profile_page_viewed"||e.data.event==="calendly.event_type_viewed")&&!trackedLoaded){trackedLoaded=true;track("loaded")}
    if(e.data.event==="calendly.date_and_time_selected")track("time_selected");
    if(e.data.event==="calendly.event_scheduled"){
      storageSet(keys.booked,"1");
      setBookedCopy();
      track("booked");
    }
  });

  if(storageGet(keys.auto)!=="1"&&storageGet(keys.dismissed)!=="1"&&storageGet(keys.booked)!=="1"){
    autoTimer=window.setTimeout(function(){
      if(current!=="pill")return;
      storageSet(keys.auto,"1");
      showCard("auto",false);
    },12000);
  }
})();
</script>
${END}`;

if (!/<\/body>/i.test(html)) {
  throw new Error("Could not find </body> in the campaign page.");
}

html = html.replace(/<\/body>/i, `${block}\n</body>`);
fs.writeFileSync(PAGE, html);
console.log("Built the /ai-training/ booking prompt.");
