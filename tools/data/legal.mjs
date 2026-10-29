// Legal page content. Describes ONLY what the website/code actually does (verified by audit on 2026-10-17).
// Owner-dependent facts (legal entity name, mailing address, governing state, retention period, "sale/share" confirmation)
// are NOT invented here; they appear automatically once set in config.mjs and are tracked in COMPLIANCE_IMPLEMENTATION.md.
import { site } from './config.mjs';

const email = site.email, phone = site.phone;
const operator = site.legalName ? `${site.legalName} (doing business as ${site.name})` : site.name;
const addr = site.address ? ` Our mailing address is ${site.address}.` : '';

export const legalUpdated = site.legalUpdated;

export const privacy = {
  title: 'Privacy Policy',
  intro: `This Privacy Policy explains what personal information ${operator} ("we", "us") collects through ${site.domain.replace('https://', '')} (the "website"), how we use and protect it, and the choices you have. By submitting an inquiry or using the website you acknowledge this policy.`,
  sections: [
    { h: 'Who we are', p: [
      `${operator} is an independent publishing-services provider. We offer writing, editing, design, formatting, publishing-support, marketing and promotion services to authors, and operate this website to describe those services and receive inquiries.${addr}`,
      `You can contact us by phone on ${phone}, or by email at ${email}.`,
      `Not affiliated with Amazon. ${site.disclaimer}`,
    ] },
    { h: 'Information we collect', p: ['We collect the following categories of information.'], ul: [
      'Information you give us: your name, email address and phone number (required on our forms), and, if you choose to provide them, the service you are interested in, your book title, manuscript status and a description of your project. Our forms require you to tick the privacy-and-terms acknowledgement checkbox before you submit. If you use live chat, we also receive the messages and contact details you type into the chat. If you call us, we receive what you tell us.',
      'Campaign and page details attached to your inquiry: the page you submitted the form from, the website that referred you, and advertising-campaign parameters in the page address (such as utm_source, utm_medium, utm_campaign and click identifiers such as gclid, gbraid or wbraid). The website keeps these in your browser\'s session storage while the tab is open so they can be attached to your inquiry.',
      'Technical information: your IP address and browser details are processed by our web server and hosting provider when you load pages or submit a form. We use a one-way (hashed) form of your IP address and timestamps to limit repeated form submissions and prevent spam. The live chat provider also collects technical and usage information, as described below.',
    ], after: 'We do not collect payment card numbers or government identifiers through this website, and we ask that you do not send them in a form or chat message.' },
    { h: 'How we use information', p: ['We use the information described above to:'], ul: [
      'respond to your inquiry, answer questions and prepare quotes or proposals;',
      'provide and administer services you request;',
      'understand which pages and campaigns lead to inquiries, so we can describe and promote our services more accurately;',
      'keep the website secure, prevent spam and abuse, and troubleshoot problems; and',
      'comply with legal obligations and protect our rights.',
    ], after: 'We do not use the information for automated decision-making that has legal or similarly significant effects.' },
    { h: 'Email, telephone and text messages', p: [
      'Our forms ask for your name, email address and phone number so that we can respond to your inquiry, and they include a checkbox, which you must tick to submit, acknowledging this Privacy Policy and our Terms and that we may contact you about your inquiry. We may respond by email or by phone call, and we use your phone number only to follow up on your inquiry.',
      'The website does not currently collect consent to send text (SMS) messages, and its forms do not treat a phone number as consent to marketing texts. If we ever begin to send text messages, we will first obtain your separate, express consent that explains the type and frequency of messages, notes that message and data rates may apply, and tells you how to opt out (for example by replying STOP).',
      'You can ask us to stop contacting you at any time by emailing ' + email + ' or telling us during a call.',
    ] },
    { h: 'Cookies and similar technologies', p: [
      'The website itself does not set advertising or analytics cookies. It uses your browser\'s session storage to hold campaign parameters until you close the tab (see above).',
      'The live chat widget on this website is provided by LiveChat (LiveChat Software). When it loads, it may set cookies or use local storage to recognise your browser, keep a chat conversation going and record visit details such as pages viewed, approximate location, device and browser information. Its use of your information is described in the provider\'s own privacy policy.',
      'Page fonts are loaded from Google Fonts, so your browser sends a request, including your IP address, to Google to download them.',
      'You can block or delete cookies and local storage in your browser settings. Blocking them may stop the chat widget from working correctly.',
    ] },
    { h: 'Advertising and analytics', p: [
      'As of the date at the top of this page, this website does not use Microsoft Advertising (UET) tags, Google Analytics, Google Ads conversion tags, Meta Pixel or any other analytics or advertising pixel.',
      'We may advertise our services through online ad platforms. When you click one of our ads, the platform may add campaign parameters to the page address. We record those parameters with your inquiry (see above) so we can tell which campaign led to it.',
      'Before we install any advertising or analytics tag, we will update this policy to name the tool, explain what it is used for and what cookies or similar technologies it uses, and describe the choices available to you.',
    ] },
    { h: 'How we share information', p: ['We share personal information only as needed to run the website and provide our services:'], ul: [
      'Website hosting and infrastructure providers, which store and serve the website and process server logs.',
      'Email service providers, which transmit and store the inquiry emails we send and receive (we send inquiry notifications through our business email account).',
      'LiveChat, which provides the chat widget and stores chat conversations.',
      'Google, which serves the website\'s fonts.',
      'The editors, designers, writers or other specialists who work on a project you ask us to deliver, to the extent needed to perform that work.',
      'Professional advisers, authorities or a successor business, where required by law or in connection with a business transfer.',
    ], after: 'We do not sell personal information collected through this website, and we do not share it for cross-context behavioural advertising.' },
    { h: 'How long we keep information', p: [
      'We keep inquiry information (including the inquiry email) for as long as needed to respond to you and, if you become a client, to deliver and document the services. We then keep it for a reasonable period for business records before it is deleted, unless we are required to keep it longer by law. You can ask us to delete your inquiry information earlier (see "Your privacy rights and choices").',
      'Chat transcripts are retained under the chat provider\'s own retention settings. Anti-spam records (hashed IP and timestamps) are used only for short-term rate limiting.',
    ] },
    { h: 'Your privacy rights and choices', p: [
      `Depending on where you live, you may have the right to ask us to tell you what personal information we hold about you, to correct it, to delete it, to receive a copy of it, and to object to or limit certain uses. To make a request, email ${email} with the subject "Privacy Request", or call ${phone}.`,
      'We may need to confirm your identity before acting on a request, for example by asking you to reply from the email address you used to contact us. We will respond within the time required by applicable law. You will not be treated unfairly for exercising your rights.',
    ] },
    { h: 'California residents (CCPA/CPRA)', p: [
      'If you are a California resident, you may have the right to know what personal information we collect, use, disclose and sell or share; to request deletion or correction; to opt out of the sale or sharing of personal information; and to be free from discrimination for exercising these rights.',
      'In the last twelve months we have collected the categories of personal information described in "Information we collect" (identifiers such as name, email address, phone number and IP address; information you provide about your project; and internet or network activity such as pages viewed and referral details) for the purposes described in "How we use information".',
      'We do not sell personal information collected through this website. Because the website does not currently use advertising or analytics tags, we do not currently "share" personal information for cross-context behavioural advertising. If that changes, we will update this policy before the change. To make a request, or to opt out of any sale or sharing, email ' + email + ' with the subject "Do Not Share" or "Privacy Request", or call ' + phone + '. You may also use an authorised agent to submit a request on your behalf.',
    ] },
    { h: 'Residents of other states', p: [
      `Residents of some other U.S. states have similar privacy rights. You may use the contact methods above to make a request, and we will handle it in line with the law that applies to you.`,
    ] },
    { h: 'Children\'s privacy', p: [
      'Our services and this website are not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has given us personal information, contact us and we will delete it.',
    ] },
    { h: 'Security', p: [
      'We use reasonable technical and organisational measures to protect information, including encrypted (HTTPS) connections for the website, encrypted connections to our email service, spam and rate-limit controls on forms, and limiting access to inquiry information to people who need it. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.',
    ] },
    { h: 'Third-party websites and services', p: [
      'The website may link to third-party websites and platforms, including publishing platforms. We are not responsible for their content or privacy practices. Please read their policies.',
    ] },
    { h: 'Changes to this policy', p: [
      'We may update this policy as our practices or the law change, for example before we add an analytics or advertising tool. The "Last Updated" date at the top shows when it was last revised.',
    ] },
    { h: 'Contact us', p: [
      `${operator}. Phone: ${phone}. Email: ${email}.${addr}`,
    ] },
  ],
};

export const terms = {
  title: 'Terms and Conditions',
  intro: `These Terms and Conditions ("Terms") apply to your use of ${site.domain.replace('https://', '')} and to enquiries about services offered by ${operator} ("we", "us"). By using the website you agree to them. Our handling of personal information is described in our <a href="/privacy-policy">Privacy Policy</a>.`,
  sections: [
    { h: 'Who we are', p: [
      `${operator} is an independent publishing-services provider. Phone: ${phone}. Email: ${email}.${addr}`,
      `Not affiliated with Amazon. ${site.disclaimer}`,
    ] },
    { h: 'Our services', p: [
      'We offer services to authors, including book publishing support, Amazon (KDP) publishing support, book marketing and promotion, ebook writing and publishing, audiobook production, SEO and article/blog writing, copywriting, ghostwriting, editing and proofreading, formatting, cover design, illustration, printing guidance, book trailers and author website development. The services available for a particular project are those set out in your written quote, proposal or agreement.',
    ] },
    { h: 'Inquiries, quotes and agreements', p: [
      'Submitting a form, using live chat or calling us is an enquiry only. It does not create a contract or oblige either party to proceed. A project begins only when we have confirmed the scope, timeline and fees with you in writing (a quote, proposal or service agreement).',
      'Prices, payment schedules, deposits, revision limits, cancellation and refund terms for a project are those stated in your written quote or agreement. Nothing on this website is a binding price offer.',
    ] },
    { h: 'Scope of work and your responsibilities', p: ['Where we provide services for you, you agree to:'], ul: [
      'give us accurate, complete information and materials in good time;',
      'review drafts and give feedback within the timeframe agreed, since delays on your side can move delivery dates;',
      'make decisions about your own book, including title, content, pricing and the platforms you publish on; and',
      'hold and maintain your own accounts on third-party publishing platforms. We can guide you but you remain the account holder.',
    ] },
    { h: 'Intellectual property and permissions', p: [
      'You keep ownership of your manuscript and other materials you supply. You confirm that you own, or have permission to use, everything you give us (including text, images, fonts and artwork), and that it does not infringe anyone else\'s rights.',
      'You give us permission to use your materials solely to perform the agreed services. Ownership and usage rights for finished work we create for you (such as covers, illustrations or edited text) are set out in your written agreement for the project. We will not display your project publicly, for example in a portfolio, without your permission.',
      'The website\'s design, text, logo and other content belong to us or our licensors and may not be copied or reused without permission. The sample book covers shown on the home page are illustrative samples, not client projects. Any titles, artwork and related rights belong to their respective owners.',
    ] },
    { h: 'Materials you submit through the website', p: [
      'Please submit only information relevant to your enquiry and do not include payment card numbers or government identifiers. We use submitted information as described in the Privacy Policy.',
    ] },
    { h: 'Third-party platforms and services', p: [
      'Our services may involve third-party platforms (for example Amazon Kindle Direct Publishing, printers, distributors, advertising networks and stock-content providers). Those platforms set their own rules, fees, approval processes and policies, which can change. We do not control them and are not responsible for their decisions, including whether a book is accepted or how it is displayed or ranked.',
    ] },
    { h: 'No guarantees', p: [
      'We do not guarantee sales, rankings, reviews, royalties, search-engine visibility, awards, bestseller status or any particular publishing outcome. Results depend on many factors outside our control.',
    ] },
    { h: 'Website availability and acceptable use', p: [
      'We try to keep the website available and accurate but do not promise it will be uninterrupted or error-free. You agree not to misuse the website, including by attempting to gain unauthorised access, interfering with its operation, submitting spam or unlawful content, or using automated means to submit forms.',
    ] },
    { h: 'Disclaimers and limitation of liability', p: [
      'The website and its information are provided "as is" and for general information. To the extent permitted by law, we exclude liability for indirect, incidental or consequential loss arising from your use of the website. Liability under a specific services agreement is governed by that agreement. Nothing in these Terms limits liability that cannot be limited by law.',
    ] },
    { h: 'Governing law', p: [
      'These Terms are governed by the laws of the United States and of the U.S. state in which we are established, without regard to conflict-of-law rules.',
    ] },
    { h: 'Changes to these Terms', p: [
      'We may update these Terms from time to time. The "Last Updated" date shows the latest revision. Continued use of the website after a change means you accept the updated Terms.',
    ] },
    { h: 'Contact us', p: [
      `${operator}. Phone: ${phone}. Email: ${email}.${addr}`,
    ] },
  ],
};
