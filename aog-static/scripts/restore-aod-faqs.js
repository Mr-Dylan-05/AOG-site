#!/usr/bin/env node
/**
 * restore-aod-faqs.js — put the Ad On Digital questions back on /faqs/.
 *
 * The WordPress /faqs/ page (post 3049) WAS the Ad On Digital FAQ: 64 questions
 * across nine products, under the heading "Frequently Asked Questions: Ad On
 * Digital". None of it reached the static site.
 *
 * The content was written in Beaver Builder, so the export's post_content held
 * only "<!-- wp:fl-builder/layout -->" and the questions lived in the builder's
 * own data — the same flatten artifact that emptied /careers/ and
 * /ad-on-ai-division/. The static /faqs/ was then rebuilt from the Claude
 * Design page, which carries 26 Ad On Workforce questions, so the page looked
 * complete and nothing flagged the loss.
 *
 * Recovered from the database dump (adminer.sql, wp_posts row 3049) rather than
 * from git, whose copy of /faqs/aod-faqs/ is the empty shell.
 *
 * Both sets now sit on the page under their own division headings, using the
 * <details>/<summary> pattern already there — it works without JavaScript and
 * is what scripts/inject-schema.js reads to emit FAQPage structured data, so
 * all 90 questions become eligible for FAQ rich results.
 *
 * Not restored here: the "Product Terms and Conditions" document that followed
 * the FAQ in the same post. It is terms, not questions, and belongs on
 * /terms-and-conditions/ — flagged separately.
 *
 * Idempotent — re-running finds the Ad On Digital block already present.
 *
 * Usage:  node scripts/restore-aod-faqs.js [--dry]
 */

const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "public", "faqs", "index.html");
const DRY = process.argv.includes("--dry");

const AOD_FAQS = [
  ["Ad on Review", [
    ["What Happens After I Place My Order?",
     "Our project team will engage with you to set up your Ad On Review account. Your project manager will set up auto info gather mechanisms"],
    ["When Does My Subscription Billing Start?",
     "When the order is placed. The set up fee and the first months subscription is deducted from your nominated bank account"],
    ["How Long Does It Take To Set Up And Start Getting Reviews And Do You Help Get Reviews On My Behalf?",
     "Under normal circumstances, it takes 5-7 days before review requests will start being sent out. We help get reviews for you if you have chosen the Five Star Package"],
    ["Do You Provide Support To Use The Software",
     "Yes"],
    ["Do You Help Set Up And Manage Google Business And What’s The Process",
     "Yes, as an extra to our packages"],
    ["Can You Help With Setting Up My Facebook Account, So People Can Review My Business There?",
     "Yes"],
    ["Is Your Software An Overseas White-Label?",
     "No, we are an Australian designed and managed software"],
    ["How Do I Buy More SMS?",
     "You can buy these directly in the SMS top up area in the software"],
    ["Do My SMS Credits On The Five Star Package Accumulate If I Don’t Use Them?",
     "No."],
    ["If I Provide My Customer Details For You To Help Me Send Review Requests, is this Information Safe?",
     "Yes, your customers details are safe in our hands. Privacy and data security is of paramount importance to us please see our full policy here"],
  ]],
  ["Google Ads Management", [
    ["Do I need an account for Adwords with Google and who sets that up?",
     "Yes you do and Ad On Group will help set this up with you"],
    ["Who pays Google for the cost per click and how does this happen?",
     "You do. When your account is set up, you will need to put your credit card details into the payment section, so Google can charge you directly."],
    ["How does my Google budget work and How much does a click cost me?",
     "Different search terms or words cost different amounts depending on how popular they are in a particular area. Google uses a bid system. Click costs vary from a few cents per click up to multiple dollars"],
    ["What is a click?",
     "When someone sees your Ad and clicks on it to be taken to your landing page or website."],
    ["What does the Ad On Group monthly management get me?",
     "Finding the right search terms or words in your market at the best price takes expertise. Our account managers are constantly optimising the search terms to provide the best possible outcome. We also provide monthly reports"],
    ["How long does it take to set up?",
     "2-4 weeks"],
    ["Who designs the concept and display ad?",
     "Ad on Group does"],
  ]],
  ["Finder SEO", [
    ["Do I get a monthly report showing my ranking progress for my most important search terms?",
     "Yes, you get a full breakdown of how your keywords are ranking each month"],
    ["Do I have an account manager in Australia who I can communicate with?",
     "Yes, they will have regular contact with you"],
    ["How long does it take before I can start to see results of improved rankings?",
     "We usually start seeing results at the 3 - 6 month mark ( depending on the initial audit we do, as there may be substantial fixes needed first before ranking can occur )"],
    ["If I have had previous SEO work done on my website, can Ad On Group build on this?",
     "Yes"],
    ["What will the initial strategy, audit and roadmap show me?",
     "We see what needs to be done and set out a plan to share with you. Which keywords, what needs to happen on your website, what needs to happen off your website, what blogs we need to write. All laid out in a timeframe."],
    ["My package includes a 400 word blog every 2 months, do I have to do anything and why is this important?",
     "No, we write and load your blogs. They are important because they cover topics about your business and industry that people search for. If they do a search, simply put, your website should show up. Google also loves websites with new, relevant, regular content."],
    ["Is there a minimum term?",
     "Yes, like all of Ad On Group’s marketing packages there is a 12 month minimum term, and then it is on a month by month basis."],
  ]],
  ["Websites", [
    ["How Long Will My Website Take To Complete?",
     "Under normal circumstances, should you approve your content in a timely fashion, it takes 8-10 weeks"],
    ["Do I Have To Write Any Content For My New Website?",
     "No, we have professional writers that take care of all the creative writing. All you need to do is approve it!"],
    ["I Understand My Website Package Includes Regular Updates, How Does This Work?",
     "You can make regular changes (up to 12 changes annually) to content, typically, pictures, text, banners, icons. We allow up to 10% of your total website to be changed at any one time. The best way for you to manage your change requirements is to note them down so you form a list of the changes and collectively we can then discuss and implement the changes all at one time. Changes do not accumulate over time."],
    ["What’s The Process After Sign Up?",
     "First we will do an on boarding meeting, then we produce the content and get your sign off. Once we have this, we develop your site in our development environment and put it live with your approval"],
    ["Will My New Website Be Mobile Optimised And Secure?",
     "Yes"],
    ["Is My Website Indexed With Google And Content Written So It Can Be Found On Google Searches?",
     "Yes"],
    ["When Does Payment Start?",
     "When you place your order the first monthly payment and a set up fee are taken straight away. This will ensure the your job is set up and work on your website can begin"],
    ["Do You Keep Me Updated On The Progress Of My Website?",
     "Yes, we provide regular updates throughout the production and launch of your website in addition to ongoing monthly performance reports."],
  ]],
  ["Blogs", [
    ["Who comes up with the topics, concepts and content of my blog?",
     "Ad On Group does, in conjunction with your input"],
    ["How do blogs help people who are searching find my business?",
     "When we write blogs, we index them with Google, ( if we manage your website ) so when people are searching for products, services or advice, your blog should show if it is relevant to that search."],
    ["What is search engine tagging and how does it work?",
     "Certain words or phrases are listed in Google’s directory, so when people search Google’s algorithms"],
    ["Who loads my blogs onto my website?",
     "If you look after your own website ( or have another company ) it is your responsibility to load and index your blog. If we look after your website, we will do it for you."],
    ["How else can I use my blog?",
     "You could send them out to your customer base as newsletters or put them on your facebook page"],
  ]],
  ["Brochure Campaign", [
    ["Who comes up with the topics, concepts and content of my brochure?",
     "Ad On Group does, in conjunction with your input"],
    ["Do I get monthly reporting on who opens my brochure and any actions that are taken?",
     "Yes you do"],
    ["Is my customer data safe?",
     "Yes, please refer to our data protection and security policy here"],
    ["Who manages customers who unsubscribe?",
     "We do"],
    ["I get up to 500 included text message sends or up to 2500 email contacts per 2 months, what happens if I want more?",
     "You can purchase extra texts at 15c excluding GST per text. You can purchase additional email contacts at the following rates: 2501 - 5000 contacts = $100 excluding GST 5001 - 10,000 contacts = $180 excluding GST 10,001 - 15,000 contacts = $260 excluding GST 15,001 - 25,000 contacts = $400 excluding GST 25,001 - 50,000 contacts = $650 excluding GST"],
  ]],
  ["Video Flexi", [
    ["Do I Have To Write Any Content For My New Video?",
     "No"],
    ["I Understand My Video Flexi Package Includes Updates every 2 months should they be required, How Does This Work?",
     "You would need to contact us and let us know what you would like changed. You can change up to 10% of your video at any one time. Typically things like an offer, a new product or service."],
    ["What’s The Process After Sign Up?",
     "We write your script, which you approve, we then produce the video with voice over and send it to you in the form of a high def MP4."],
    ["Can I get help to upload my video onto various online platforms?",
     "Yes"],
    ["When Does Payment Start?",
     "From the point of sign up"],
    ["Do You Keep Me Updated On The Progress Of My video?",
     "Yes"],
  ]],
  ["Stimulus Marketing Packages", [
    ["Who are my ongoing point of contacts for my online marketing stimulus package?",
     "Your marketing manager is your key contact for strategic conversations and your project manager is your contact for any deliverables."],
    ["Do you provide reporting on how each product in the package is performing for my business?",
     "Yes, each product within the stimulus package has its own reporting which we provide either monthly, 2 monthly or quarterly."],
    ["What happens after signup?",
     "First you have a video meeting with your project manager to discuss any specifics and where we present your marketing strategy to you and run you through the process. We then get your various products started or set up from there."],
    ["Does my marketing manager speak to me regularly?",
     "Yes, we contact you quarterly to discuss upcoming marketing strategies, improvements, your results and new trends."],
    ["How long before all aspects of my stimulus package are up and running?",
     "Depending on what you have chosen, it can take up to 8 weeks, but on average, if there are no delays with your approvals it is generally 4-6 weeks."],
    ["Is there a minimum term for the stimulus packages?",
     "Yes, it’s 12 months."],
    ["Can I change different eligible stimulus products in and out of my stimulus package?",
     "Yes, after your 12-month minimum term you may change eligible products."],
    ["What’s the once off setup cost for?",
     "It is used to book, allocate and pay for resources to begin your job."],
    ["Do I own any of the developed material at any stage? ( ie website, software, written material, graphic design, code )",
     "Ad on Group, as part of your monthly subscription, assign all copyright and development rights for you to on a monthly basis. Software subscriptions do not allow for ownership as developed material is constantly changing, evolving and being updated."],
    ["What happens after the 12-month minimum term?",
     "Your package is billed on a month by month basis"],
    ["Can I downgrade my stimulus package to less eligible product inclusions after my minimum term?",
     "Yes"],
  ]],
  ["Facebook Packages", [
    ["Will I receive regular reporting to see how the Facebook Ads are performing?",
     "Yes, you will receive monthly reports outlining your ads and how they are tracking."],
    ["Is there an account manager in Australia I can get in touch with if I have any questions?",
     "Yes, we will regularly communicate with you to ensure you’re always kept in the loop."],
    ["My website is managed by another company, can I still get Facebook Ads with Ad On Group?",
     "Yes, but you will just need to ensure your website team can upload the Meta Pixel and/or Landing Page for your ads."],
    ["I’m already doing Google Ads, is there any point in getting Facebook Ads too?",
     "Facebook Ads are great for advertising products and services to a chosen specific audience when they aren’t necessarily searching for them. By combining Facebook Ads with your existing Google Ads, you will ultimately boost brand awareness even further and strengthen remarketing campaigns."],
    ["Is there a minimum term?",
     "Yes, like all of Ad On Group’s marketing packages there is a 12-month minimum term, and then it is on a month-by-month basis."],
  ]],
];
// Styling copied from the 26 accordions already on the page so the two sets are
// indistinguishable.
const DETAILS = "background:rgba(255,255,255,0.7);border:1px solid rgba(11,18,32,0.08);border-radius:14px;padding:0;overflow:hidden";
const SUMMARY = "list-style:none;cursor:pointer;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;gap:16px;font-size:16px;font-weight:700;letter-spacing:-0.015em;color:#0B1220";
const ICON = "flex:none;width:26px;height:26px;border-radius:8px;background:rgba(27,171,229,0.1);display:inline-flex;align-items:center;justify-content:center;color:#1BABE5;font-size:18px;font-weight:600";
const ANSWER = "padding:0 22px 20px;font-size:15px;line-height:1.65;color:#4A5462";
const EYEBROW = "display:inline-flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:15px;letter-spacing:0.16em;color:#1BABE5;text-transform:uppercase";
const RULE = "width:22px;height:1.5px;background:#1BABE5";
const H2 = "font-size:clamp(22px,2.7vw,34px);line-height:1.1;letter-spacing:-0.03em;font-weight:800;margin:14px 0 12px";
const H3 = "font-size:19px;line-height:1.25;letter-spacing:-0.02em;font-weight:800;margin:28px 0 12px;color:#0B1220";
const LEAD = "font-size:16px;line-height:1.7;color:#4A5462;margin:0 0 22px";
const CONTAINER = 'display:flex;flex-direction:column;gap:12px';

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const details = ([q, a]) =>
  `      <details style="${DETAILS}">\n` +
  `        <summary style="${SUMMARY}">${esc(q)}<span style="${ICON}">+</span></summary>\n` +
  `        <div style="${ANSWER}">${esc(a)}</div>\n` +
  `      </details>`;

/** A labelled division heading, matching the "Privacy & data protection" block. */
const divisionHeading = (eyebrow, title, lead) =>
  `    <span style="${EYEBROW}"><span style="${RULE}"></span>${eyebrow}</span>\n` +
  `    <h2 style="${H2}">${title}</h2>\n` +
  (lead ? `    <p style="${LEAD}">${lead}</p>\n` : "");

let html = fs.readFileSync(FILE, "utf8");

if (html.includes("Ad On Digital questions")) {
  console.log("Ad On Digital questions already present — nothing to do");
  process.exit(0);
}

// The single existing accordion, holding the 26 Ad On Workforce questions.
const OPEN = `<div style="${CONTAINER}">`;
const start = html.indexOf(OPEN);
if (start === -1) { console.error("! accordion container not found"); process.exit(1); }

// Walk to its matching close.
const re = /<div\b|<\/div>/gi;
re.lastIndex = start;
let depth = 0, end = -1, m;
while ((m = re.exec(html)) !== null) {
  depth += m[0].toLowerCase() === "</div>" ? -1 : 1;
  if (depth === 0) { end = m.index + m[0].length; break; }
}
if (end === -1) { console.error("! unbalanced accordion container"); process.exit(1); }

const existing = (html.slice(start, end).match(/<details/g) || []).length;

// Label the existing set, now that a second division's questions follow it.
const workforceLabel = divisionHeading(
  "Ad On Workforce",
  "Offshore staffing questions",
  "Hiring, onboarding, managing and paying for offshore staff."
);

// The recovered Ad On Digital questions, grouped by product.
const digital =
  `\n\n  <section data-reveal style="max-width:900px;margin:0 auto;padding:36px 28px 24px">\n` +
  divisionHeading(
    "Ad On Digital",
    "Ad On Digital questions",
    "Websites, SEO, Google Ads, Facebook, blogs, brochure campaigns, video and reviews."
  ) +
  AOD_FAQS.map(([category, qs]) =>
    `\n    <h3 style="${H3}">${esc(category)}</h3>\n` +
    `    <div style="${CONTAINER}">\n${qs.map(details).join("\n\n")}\n    </div>`
  ).join("\n") +
  `\n  </section>`;

html = html.slice(0, start) + workforceLabel + html.slice(start, end) + digital + html.slice(end);

if (!DRY) fs.writeFileSync(FILE, html);

const added = AOD_FAQS.reduce((n, [, qs]) => n + qs.length, 0);
console.log(`${DRY ? "[dry run] " : ""}/faqs/ — Ad On Digital questions restored`);
console.log(`  existing Ad On Workforce questions : ${existing}`);
console.log(`  Ad On Digital products added       : ${AOD_FAQS.length}`);
console.log(`  Ad On Digital questions added      : ${added}`);
console.log(`  total on the page                  : ${existing + added}`);
