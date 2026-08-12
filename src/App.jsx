import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

const legalPages = {
  "/privacy": {
    title: "Privacy Policy",
    intro: "This Privacy Policy explains how BlueJob collects, uses, shares, and protects information when you use the BlueJob platform.",
    sections: [
      ["Information we collect", "We collect account and contact information, profile details, skills, work history, verification information, uploaded documents and evidence, ratings, BlueJob™ Work Score data, device and log information, and payment information when payments are available through the platform."],
      ["How we use information", "We use information to operate and improve BlueJob, create and maintain work identities, provide verification and matching features, calculate and display Work Score information, communicate with you, prevent fraud and misuse, and meet legal obligations."],
      ["Sharing and service providers", "We may share information with other platform users as needed for profiles, jobs, work agreements, ratings, and verification. We also use service providers that help us host, secure, analyze, support, and process payments for the service."],
      ["Security and retention", "We use reasonable administrative, technical, and organizational measures to protect information. We retain information for as long as needed to provide the service, comply with law, resolve disputes, and enforce agreements."],
      ["Your choices and rights", "You may access, update, or request deletion of certain account information, subject to legal and operational limits. You may opt out of non-essential marketing communications. Contact us to make a privacy request."],
      ["Updates and contact", "We may update this policy and will post the revised version here. For questions or requests, contact BlueJob through our Contact page."],
    ],
  },
  "/terms": {
    title: "Terms of Service",
    intro: "These Terms of Service govern your use of BlueJob, a platform that helps workers, contractors, subcontractors, and companies connect through work identity, verification, and reputation tools.",
    sections: [
      ["Eligibility and accounts", "You must be legally able to form a binding agreement and provide accurate account information. You are responsible for maintaining the confidentiality of your account and for activity under it."],
      ["Platform role", "BlueJob provides a platform and tools; it is not an employer, staffing agency, contractor, insurer, licensing authority, or guarantor. Workers, contractors, subcontractors, and companies remain independent parties responsible for their own decisions and obligations."],
      ["Jobs and work agreements", "Users are responsible for evaluating opportunities, negotiating work agreements, obtaining permits or insurance, and complying with applicable law. BlueJob does not guarantee employment, worker quality, payment, licensing, safety, or the outcome of any work."],
      ["Verification, Work Score, and ratings", "Verification, ratings, and BlueJob™ Work Score information are platform signals based on available information and may change. They are not endorsements, warranties, credit scores, or guarantees. Users must not manipulate ratings, verification, or Work Score data."],
      ["Payments, fees, and disputes", "If payment features are offered, applicable fees and payment terms will be presented before use. Parties to a job are responsible for their own agreements and disputes. BlueJob may assist with platform records but is not required to resolve disputes."],
      ["Content and prohibited conduct", "You retain responsibility for documents, evidence, listings, and other content you upload. Do not submit unlawful, misleading, infringing, unsafe, discriminatory, or harmful content; impersonate others; interfere with the service; or misuse another person’s information."],
      ["Intellectual property, suspension, and termination", "BlueJob and its content, marks, and platform features are protected by law. We may suspend or terminate access for violations, risk, or operational reasons. You may stop using the service at any time, subject to outstanding obligations."],
      ["Disclaimers, liability, and changes", "The service is provided as available to the extent permitted by law. BlueJob disclaims warranties not expressly stated here and is not liable for indirect, incidental, special, consequential, or punitive damages. We may update these Terms by posting an updated version. Contact us through our Contact page with questions."],
    ],
  },
  "/cookies": {
    title: "Cookie Policy",
    intro: "BlueJob uses cookies and similar technologies to keep the platform secure, remember preferences, understand performance, and improve the service.",
    sections: [
      ["How cookies are used", "Essential cookies support core functionality and security. Analytics technologies help us understand how visitors use the platform. Where required, we will request consent for non-essential cookies."],
      ["Your choices", "You can manage cookies through your browser settings. Blocking some cookies may affect features of the BlueJob platform."],
    ],
  },
  "/community-guidelines": {
    title: "Community Guidelines",
    intro: "BlueJob is built for professional, trustworthy work connections.",
    sections: [
      ["Be accurate and respectful", "Use your real identity, describe experience honestly, and treat every platform participant with respect."],
      ["Protect trust", "Do not falsify work history, verification evidence, ratings, credentials, or BlueJob™ Work Score-related information. Report suspected fraud, harassment, or unsafe conduct."],
      ["Keep the platform professional", "Do not post illegal, discriminatory, threatening, sexually explicit, or infringing content, or use BlueJob to solicit conduct unrelated to legitimate work opportunities."],
    ],
  },
  "/contact": {
    title: "Contact BlueJob",
    intro: "Questions about BlueJob, privacy, terms, verification, or your account are welcome.",
    sections: [
      ["Get in touch", "Use the support contact options available in your BlueJob account. For legal, privacy, or platform questions, send a detailed request through the account support channel so our team can respond appropriately."],
    ],
  },
  "/about": {
    title: "About BlueJob",
    intro: "BlueJob helps skilled workers, contractors, subcontractors, and companies build better work connections through verified work history and professional reputation.",
    sections: [
      ["Our purpose", "We are building a clearer way to present work identity, completed work, verification, and reputation—so people can make better-informed work decisions."],
      ["BlueJob™ Work Score", "Work Score is a BlueJob product feature designed to present work-reputation signals consistently. It does not replace independent judgment or professional due diligence."],
    ],
  },
};

function BrandMark({ compact = false }) {
  return (
    <span className={`brandMark${compact ? " compact" : ""}`}>
      <img src="/bluejob-logo.png" alt="BlueJob" />
    </span>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footerInner">
        <div className="footerBrand">
          <BrandMark compact />
          <p>© 2026 BlueJob. All rights reserved.</p>
        </div>
        <nav className="footerLinks" aria-label="Legal and company links">
          <a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a>
          <a href="/cookies">Cookie Policy</a><a href="/community-guidelines">Community Guidelines</a>
          <a href="/contact">Contact</a><a href="/about">About BlueJob</a>
        </nav>
        <p className="trademark">BlueJob™ and Work Score are trademarks/brand identifiers of BlueJob. All other trademarks belong to their respective owners.</p>
      </div>
    </footer>
  );
}

function LegalPage({ page }) {
  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="/" aria-label="BlueJob home"><BrandMark /></a>
        <a className="backHome" href="/">Back to BlueJob</a>
      </header>
      <main className="legalPage">
        <p className="legalEyebrow">BlueJob™</p>
        <h1>{page.title}</h1>
        <p className="legalIntro">{page.intro}</p>
        {page.sections.map(([heading, text]) => <section key={heading}><h2>{heading}</h2><p>{text}</p></section>)}
      </main>
      <Footer />
    </div>
  );
}

function LandingPage() {
  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="/" aria-label="BlueJob home"><BrandMark /></a>
        <nav><a href="#workers">Workers</a><a href="#companies">Companies</a><a href="#workscore">Work Score</a></nav>
        <div className="navActions">
          <a className="loginButton" href="#workers">Log in</a>
          <a className="primaryButton joinButton" href="#workers">Join BlueJob</a>
        </div>
      </header>
      <main>
        <section className="hero">
          <div className="heroContent">
            <div className="eyebrow"><BadgeCheck size={17} />The verified network for real work</div>
            <h1>Your work should<span> speak for itself.</span></h1>
            <p className="heroDescription">BlueJob connects skilled workers, contractors and companies through verified work history, reputation and opportunity.</p>
            <div className="heroButtons">
              <a className="primaryButton large" href="#workers">Build your profile<ArrowRight size={18} /></a>
              <a className="secondaryButton large" href="#companies">Find workers</a>
            </div>
            <div className="trustLine"><ShieldCheck size={19} />Verified work. Verified people. Real reputation.</div>
          </div>
          <div className="scoreCard" id="workscore">
            <div className="scoreHeader">
              <div><BrandMark compact /><h3>Work Score</h3></div>
              <div className="verified"><BadgeCheck size={17} />Verified</div>
            </div>
            <div className="score">842</div><div className="scoreLabel">EXCELLENT WORK REPUTATION</div>
            <div className="scoreBar"><div className="scoreProgress" /></div>
            <div className="scoreStats"><div><strong>48</strong><span>Verified Jobs</span></div><div><strong>4.9</strong><span>Work Rating</span></div><div><strong>97%</strong><span>Reliability</span></div></div>
          </div>
        </section>
        <section className="features">
          <div className="feature" id="workers"><div className="iconBox"><Users /></div><p className="productLabel">BlueJob Work Identity</p><h3>Build Your Work Identity</h3><p>Skills, experience, completed jobs and verified performance become part of one professional work profile.</p></div>
          <div className="feature" id="companies"><div className="iconBox"><BriefcaseBusiness /></div><h3>Find Proven Workers</h3><p>Companies can discover workers based on actual experience, reliability and verified work history.</p></div>
          <div className="feature"><div className="iconBox"><Star /></div><div className="featureBrand"><BrandMark compact /><span>Work Score</span></div><h3>Earn Your Work Score</h3><p>Build a portable reputation that gets stronger every time verified work is completed.</p></div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const page = legalPages[window.location.pathname];
  return page ? <LegalPage page={page} /> : <LandingPage />;
}
