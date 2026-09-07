/**
 * curriculum.js — what the program actually teaches.
 *
 * Lifted from the sales page's curriculum block, which is the authoritative
 * description of the product. The industry pages shipped without any of it,
 * saying only "24 modules over three months" — which tells a buyer nothing and
 * tells an answer engine less. "What does Ad On Group teach?" is precisely the
 * question these pages need to answer better than anyone, and the answer was
 * sitting on one page the campaign traffic sees and search does not.
 *
 * `teaches` is the flat competency list, used for the Course schema's `teaches`
 * property so the syllabus is machine-readable as well as on the page.
 */
const MONTHS = [
  {
    n: 1,
    name: "Foundations",
    tag: "get fluent",
    body:
      "Advanced prompt engineering and context management. Claude Projects that hold everything about your business, so nobody re-explains it every time. Getting AI to work across your documents, images and screenshots. Building your first AI-powered workflow, end to end.",
    teaches: [
      "Advanced prompt engineering",
      "Context management",
      "Claude Projects for business context",
      "Working with documents, images and screenshots",
      "Building an AI-powered workflow end to end",
    ],
  },
  {
    n: 2,
    name: "Automating your tasks",
    tag: "get your time back",
    body:
      "Teaching AI your job. Custom Claude skills built around how your team actually works, plus a meta skill that writes the next ones. Claude Cowork and Claude in Chrome browser automations across the tools you already use, scheduled to run without anyone starting them.",
    teaches: [
      "Custom Claude skills",
      "Meta skills that build further skills",
      "Claude Cowork automations",
      "Claude in Chrome browser automation",
      "Scheduling automations to run unattended",
    ],
  },
  {
    n: 3,
    name: "Agentic AI",
    tag: "go autonomous",
    body:
      "Handing whole jobs over. Building autonomous AI agents that carry out complete processes on their own — deciding what to do next, working across your tools, running start to finish without anyone watching — then an orchestrator agent that directs them all as one system.",
    teaches: [
      "Building autonomous AI agents",
      "Multi-step processes across business tools",
      "Orchestrator agents directing other agents",
    ],
  },
];

module.exports = () => ({
  moduleCount: 24,
  duration: "three months",
  weeklyHours: "around two hours a week",
  months: MONTHS,
  teaches: MONTHS.flatMap((m) => m.teaches),
  pdf: "/assets/ai-training-curriculum.pdf",
});
