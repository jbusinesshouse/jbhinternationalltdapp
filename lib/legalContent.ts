/**
 * Canonical Privacy Policy & Terms for JBH International Limited.
 * Keep in sync with j-business-house/lib/legalContent.ts
 */

export const LEGAL_CONTACT_EMAIL = "marketplace@jbhinternationallimited.com";
export const LEGAL_COMPANY = "JBH International Limited";
export const LEGAL_EFFECTIVE_DATE = "21 October 2026";
export const LEGAL_LAST_UPDATED = "21 October 2026";

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalDocument = {
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  sectionsEn: LegalSection[];
  sectionsBn: LegalSection[];
};

export const PRIVACY_POLICY: LegalDocument = {
  title: "Privacy Policy",
  effectiveDate: LEGAL_EFFECTIVE_DATE,
  lastUpdated: LEGAL_LAST_UPDATED,
  sectionsEn: [
    {
      title: "1. Who we are",
      paragraphs: [
        `${LEGAL_COMPANY} (“JBH”, “we”, “us”, or “our”) operates a B2B clothing marketplace through our mobile application and website (together, the “Platform”). This Privacy Policy explains what personal data we collect, how we use it, and the choices you have.`,
        `Contact for privacy questions: ${LEGAL_CONTACT_EMAIL}.`,
      ],
    },
    {
      title: "2. Scope",
      paragraphs: [
        "This Policy applies to accounts and visitors using our app and website, including wholesale sellers, retail buyers, and other registered users. By creating an account or using the Platform, you acknowledge this Policy.",
      ],
    },
    {
      title: "3. Information we collect",
      paragraphs: [
        "Account and profile data: name, email, phone number, password (stored securely by our auth provider), avatar, store name, store type (wholesale or retail), business/store address (district, upazila, address), and account status (for example active, restricted, or freeze).",
        "Delivery data: saved delivery addresses and the city/address snapshots stored on orders you place.",
        "Marketplace activity: product listings (names, descriptions, images, prices you enter as base/ex-VAT amounts, MOQ, stock/variants), orders and order line snapshots (including quantity, base price, VAT rate, VAT amount, and VAT-inclusive unit price), reviews, ratings, and related notifications.",
        "Communications: in-app chat messages, support requests, reports about users or listings, and block relationships you create.",
        "Promotions and growth: product advertisement requests, featured-store requests, and referral / content-creator related application data where you choose to participate.",
        "Device and technical data: push notification tokens, approximate device/app identifiers needed to deliver notifications, IP address and basic logs from our servers and hosting providers, and local preferences stored on your device (for example catalog filters).",
        "We do not intentionally collect payment card numbers on the Platform for buyer–seller settlements. Any payment between buyers and sellers is arranged between those parties unless we clearly state otherwise for a specific feature.",
      ],
    },
    {
      title: "4. How we use your information",
      paragraphs: [
        "To create and manage your account, verify eligibility for selling or buying features, and apply account statuses such as restricted or freeze when needed for safety, compliance, or policy enforcement.",
        "To operate the marketplace: show listings (including retail/wholesale filters), calculate and display VAT-inclusive buyer prices (currently 10% for wholesale sellers and 15% for retail sellers on the seller’s base price), process orders, notify parties of order events, and keep financial snapshots for records.",
        "To enable messaging, notifications (including push and in-app), support, reviews, blocking, and reporting.",
        "To process optional promotions (ads, featured stores) and referral programmes you join.",
        "To secure the Platform, prevent fraud and abuse, debug issues, improve performance, and comply with applicable law.",
        "To contact you about your account, orders, policy updates, or service messages. Marketing messages, if any, will follow applicable rules and your choices where required.",
      ],
    },
    {
      title: "5. Legal bases and sharing",
      paragraphs: [
        "We process data to perform our contract with you (providing the Platform), to pursue legitimate interests (security, product improvement, marketplace integrity), and where required by law.",
        "We share data with: (a) other users as needed for marketplace functions (for example sellers see buyer order/contact details for fulfilment; buyers see public store and listing information); (b) service providers who process data on our instructions (hosting, database, authentication, file storage, email delivery, push notifications, analytics if enabled); (c) authorities when legally required; and (d) professional advisers under confidentiality.",
        "We do not sell your personal data.",
      ],
    },
    {
      title: "6. Account status, moderation, and visibility",
      paragraphs: [
        "We may mark accounts as restricted or frozen. Restricted accounts may lose selling or listing privileges while some buyer features can remain available. Frozen accounts may lose buying, selling, messaging, and related privileges until we lift the status.",
        "Public listings from sellers who are not eligible to be shown may be hidden from browse and search. Order and chat history may still be retained for records and dispute handling.",
      ],
    },
    {
      title: "7. Retention",
      paragraphs: [
        "We keep account and transaction data for as long as your account is active and as needed afterwards for legal, tax, accounting, dispute, and security purposes. Order line VAT and price snapshots are retained as part of order records. You may request deletion subject to lawful retention needs; some data may remain in backups for a limited period.",
      ],
    },
    {
      title: "8. Security",
      paragraphs: [
        "We use reasonable technical and organisational measures (including access controls and encrypted transport where applicable). No method of transmission or storage is 100% secure. Please protect your login credentials and notify us of suspected unauthorised access.",
      ],
    },
    {
      title: "9. Your choices and rights",
      paragraphs: [
        "You can update much of your profile and delivery information in the app or website. You can control some notification preferences on your device. You may request access, correction, or deletion of personal data, or raise a privacy concern, by emailing us. We may need to verify your identity before acting on a request.",
      ],
    },
    {
      title: "10. Children",
      paragraphs: [
        "The Platform is intended for business users. It is not directed at children under 18. If you believe a child has provided personal data, contact us and we will take appropriate steps.",
      ],
    },
    {
      title: "11. International processing",
      paragraphs: [
        "Our service providers may process data in countries other than Bangladesh. Where we transfer data, we take steps appropriate to the service relationship and applicable law.",
      ],
    },
    {
      title: "12. Changes",
      paragraphs: [
        "We may update this Privacy Policy. The “Last updated” date will change when we do. Material changes may also be communicated in the app, on the website, or by email. Continued use after the effective date of changes means you accept the updated Policy, except where additional consent is required by law.",
      ],
    },
    {
      title: "13. Contact",
      paragraphs: [
        `${LEGAL_COMPANY}`,
        `Email: ${LEGAL_CONTACT_EMAIL}`,
      ],
    },
  ],
  sectionsBn: [
    {
      title: "১. আমরা কারা",
      paragraphs: [
        `${LEGAL_COMPANY} (“JBH”, “আমরা”) মোবাইল অ্যাপ ও ওয়েবসাইটের মাধ্যমে একটি বি২বি পোশাক মার্কেটপ্লেস পরিচালনা করে। এই প্রাইভেসি পলিসিতে ব্যাখ্যা করা হয়েছে আমরা কী ব্যক্তিগত তথ্য সংগ্রহ করি, কীভাবে ব্যবহার করি এবং আপনার কী অধিকার আছে।`,
        `গোপনীয়তা সংক্রান্ত যোগাযোগ: ${LEGAL_CONTACT_EMAIL}।`,
      ],
    },
    {
      title: "২. পরিধি",
      paragraphs: [
        "এই নীতি আমাদের অ্যাপ ও ওয়েবসাইটের ব্যবহারকারীদের জন্য প্রযোজ্য—পাইকারি বিক্রেতা, খুচরা ক্রেতা ও অন্যান্য নিবন্ধিত ব্যবহারকারীসহ। অ্যাকাউন্ট তৈরি বা প্ল্যাটফর্ম ব্যবহারের মাধ্যমে আপনি এই নীতি স্বীকার করেন।",
      ],
    },
    {
      title: "৩. আমরা যে তথ্য সংগ্রহ করি",
      paragraphs: [
        "অ্যাকাউন্ট ও প্রোফাইল: নাম, ইমেইল, ফোন, পাসওয়ার্ড (আমাদের অথ প্রদানকারীর মাধ্যমে সুরক্ষিত), অবতার, দোকানের নাম, দোকানের ধরন (পাইকারি/খুচরা), ব্যবসায়িক ঠিকানা এবং অ্যাকাউন্ট স্ট্যাটাস (যেমন active, restricted, freeze)।",
        "ডেলিভারি: সংরক্ষিত ডেলিভারি ঠিকানা এবং অর্ডারে সংরক্ষিত শহর/ঠিকানার স্ন্যাপশট।",
        "মার্কেটপ্লেস কার্যক্রম: পণ্য তালিকা, অর্ডার ও লাইন আইটেমের স্ন্যাপশট (পরিমাণ, বেস মূল্য, ভ্যাট হার, ভ্যাট পরিমাণ এবং ভ্যাটসহ ইউনিট মূল্য), রিভিউ, রেটিং ও সংশ্লিষ্ট নোটিফিকেশন।",
        "যোগাযোগ: ইন-অ্যাপ চ্যাট, সাপোর্ট অনুরোধ, রিপোর্ট ও ব্লক সম্পর্ক।",
        "প্রমোশন ও রেফারেল: বিজ্ঞাপন/ফিচার্ড স্টোর অনুরোধ এবং রেফারেল সংক্রান্ত আবেদনের তথ্য (আপনি অংশ নিলে)।",
        "ডিভাইস ও প্রযুক্তিগত তথ্য: পুশ নোটিফিকেশন টোকেন, সার্ভার লগ/আইপি এবং ডিভাইসে সংরক্ষিত পছন্দ (যেমন ক্যাটালগ ফিল্টার)।",
      ],
    },
    {
      title: "৪. তথ্যের ব্যবহার",
      paragraphs: [
        "অ্যাকাউন্ট পরিচালনা, বিক্রয়/ক্রয় সুবিধার যোগ্যতা যাচাই এবং নিরাপত্তা বা নীতি প্রয়োগের জন্য restricted/freeze স্ট্যাটাস প্রয়োগ।",
        "মার্কেটপ্লেস পরিচালনা: তালিকা দেখানো, ক্রেতাদের জন্য ভ্যাটসহ মূল্য হিসাব ও প্রদর্শন (বর্তমানে পাইকারি বিক্রেতার বেস মূল্যে ১০% এবং খুচরা বিক্রেতার বেস মূল্যে ১৫%), অর্ডার প্রক্রিয়া ও নোটিফিকেশন।",
        "মেসেজিং, পুশ/ইন-অ্যাপ নোটিফিকেশন, সাপোর্ট, রিভিউ, ব্লক ও রিপোর্ট সক্ষম করা।",
        "ঐচ্ছিক প্রমোশন ও রেফারেল প্রোগ্রাম পরিচালনা।",
        "নিরাপত্তা, জালিয়াতি প্রতিরোধ, সমস্যা সমাধান, উন্নয়ন এবং আইন মেনে চলা।",
      ],
    },
    {
      title: "৫. শেয়ারিং",
      paragraphs: [
        "মার্কেটপ্লেস কার্যক্রমের জন্য প্রয়োজনীয় তথ্য অন্য ব্যবহারকারীদের সাথে শেয়ার হতে পারে (যেমন অর্ডার পূরণের জন্য বিক্রেতা ক্রেতার যোগাযোগ তথ্য দেখতে পারে)। আমরা হোস্টিং, অথেন্টিকেশন, স্টোরেজ, ইমেইল ও পুশ নোটিফিকেশনের মতো সেবা প্রদানকারীদের নির্দেশ অনুযায়ী তথ্য প্রক্রিয়া করতে দিই। আমরা আপনার ব্যক্তিগত তথ্য বিক্রি করি না।",
      ],
    },
    {
      title: "৬. অ্যাকাউন্ট স্ট্যাটাস",
      paragraphs: [
        "Restricted অ্যাকাউন্টে বিক্রয়/লিস্টিং সীমিত হতে পারে; freeze অ্যাকাউন্টে ক্রয়, বিক্রয়, মেসেজিং ইত্যাদি সীমিত হতে পারে। অযোগ্য বিক্রেতার পাবলিক তালিকা লুকানো হতে পারে।",
      ],
    },
    {
      title: "৭. সংরক্ষণ ও নিরাপত্তা",
      paragraphs: [
        "অ্যাকাউন্ট ও লেনদেনের তথ্য প্রয়োজন অনুযায়ী সংরক্ষণ করা হয়। আমরা যুক্তিসঙ্গত নিরাপত্তা ব্যবস্থা গ্রহণ করি, তবে কোনো ব্যবস্থাই সম্পূর্ণ নিরাপদ নয়।",
      ],
    },
    {
      title: "৮. আপনার অধিকার",
      paragraphs: [
        "আপনি প্রোফাইল হালনাগাদ করতে পারেন এবং ইমেইলের মাধ্যমে অ্যাক্সেস, সংশোধন বা মুছে ফেলার অনুরোধ করতে পারেন। আইনি প্রয়োজনে কিছু তথ্য রাখা হতে পারে।",
      ],
    },
    {
      title: "৯. শিশু ও পরিবর্তন",
      paragraphs: [
        "প্ল্যাটফর্ম ব্যবসায়িক ব্যবহারকারীদের জন্য; ১৮ বছরের কম বয়সীদের উদ্দেশ্যে নয়। নীতিমালা পরিবর্তন হলে তারিখ হালনাগাদ করা হবে।",
      ],
    },
    {
      title: "১০. যোগাযোগ",
      paragraphs: [
        `${LEGAL_COMPANY}`,
        `ইমেইল: ${LEGAL_CONTACT_EMAIL}`,
      ],
    },
  ],
};

export const TERMS_AND_CONDITIONS: LegalDocument = {
  title: "Terms & Conditions",
  effectiveDate: LEGAL_EFFECTIVE_DATE,
  lastUpdated: LEGAL_LAST_UPDATED,
  sectionsEn: [
    {
      title: "1. Agreement",
      paragraphs: [
        `These Terms & Conditions (“Terms”) govern your use of the ${LEGAL_COMPANY} marketplace available via our mobile app and website (the “Platform”). By creating an account or using the Platform, you agree to these Terms and our Privacy Policy.`,
        "If you do not agree, do not use the Platform.",
      ],
    },
    {
      title: "2. The Platform (marketplace role)",
      paragraphs: [
        "JBH provides technology that connects clothing wholesalers and retailers. Unless we expressly state otherwise in writing for a specific transaction, JBH is not the buyer or seller of listed goods, does not take title to goods, and is not a party to the sales contract between users.",
        "Sellers are responsible for product quality, legality, inventory accuracy, fulfilment, after-sales issues, and any warranties they offer. Buyers are responsible for reviewing listings, confirming suitability, and paying sellers as agreed between the parties.",
      ],
    },
    {
      title: "3. Eligibility and accounts",
      paragraphs: [
        "You must be at least 18 and able to form a binding contract under the laws of Bangladesh. You must provide accurate registration and store information and keep it updated.",
        "You are responsible for safeguarding your login credentials and for activity under your account. Notify us promptly of unauthorised use.",
        "Store type matters: wholesale accounts may list products and manage sales; retail accounts primarily buy. Misrepresenting your store type or business details is a breach of these Terms.",
      ],
    },
    {
      title: "4. Listings, pricing, and VAT",
      paragraphs: [
        "Sellers enter a base (ex-VAT) unit price for each product. For buyer display and checkout, the Platform applies VAT on that base: currently 10% where the seller’s store type is wholesale, and 15% where the seller’s store type is retail (unless we publish a different rate).",
        "The amount charged for an order uses the VAT-inclusive unit price calculated by our servers at order time. Order records may store base price, VAT rate, VAT amount, and inclusive price snapshots. Changing a product’s base price later does not alter completed orders.",
        "Prices, stock, MOQ, images, and descriptions must be accurate and lawful. We may remove or hide listings that violate law, these Terms, or marketplace standards.",
      ],
    },
    {
      title: "5. Orders, cancellations, and reviews",
      paragraphs: [
        "Placing an order creates a request between buyer and seller through the Platform. Order statuses (for example pending, processing, shipped, completed, cancelled, or hold) may be updated according to our flows and seller/buyer actions.",
        "Cancel requests and approvals follow the in-app/website process. We may intervene for safety, fraud, or abuse but are not obliged to mediate every commercial dispute.",
        "After eligible completed orders, buyers may be invited to leave reviews. Reviews must be honest and non-abusive. We may remove reviews that violate these Terms.",
      ],
    },
    {
      title: "6. Messaging, notifications, blocking, and reports",
      paragraphs: [
        "Chat and notifications (including push notifications where enabled) are provided to support marketplace communication. Do not use messaging for spam, harassment, scams, or illegal content.",
        "You may block other users or submit reports. We may investigate and take action, but we do not guarantee a particular outcome or response time.",
      ],
    },
    {
      title: "7. Account restriction and freeze",
      paragraphs: [
        "We may set an account to restricted or freeze (or otherwise limit access) if we reasonably believe there is policy violation, fraud risk, legal risk, abuse, unpaid obligations related to optional Platform services, incomplete verification, or other serious concerns.",
        "Restricted accounts typically cannot upload or manage listings as sellers while some buyer features may remain. Frozen accounts typically cannot place orders, sell, or use messaging until the status is lifted. Public listings from ineligible sellers may be hidden.",
        "We may reinstate, further limit, or permanently terminate accounts. You remain responsible for outstanding obligations to other users arising before restriction or freeze.",
      ],
    },
    {
      title: "8. Optional services",
      paragraphs: [
        "Features such as product advertisements, featured store placements, and referral / content-creator programmes may be offered under additional instructions shown in the request flows. Fees, durations, and approval decisions for those services are as stated at the time of request and may be accepted or declined by us.",
        "Platform fee or “due amount” collection features may change over time; if a fee programme is not active, that does not waive other Terms.",
      ],
    },
    {
      title: "9. Prohibited conduct",
      paragraphs: [
        "You must not: break applicable law; list prohibited or counterfeit goods; infringe intellectual property; scrape or attack the Platform; bypass security or access controls; manipulate prices, stock, reviews, or rankings dishonestly; harass others; create fake accounts; or use the Platform to facilitate fraud.",
      ],
    },
    {
      title: "10. Intellectual property",
      paragraphs: [
        "JBH owns the Platform software, branding, and related materials (excluding user content). You retain rights in content you upload, and grant JBH a non-exclusive licence to host, display, and use that content to operate and promote the marketplace.",
        "You confirm you have rights to the images and text you upload.",
      ],
    },
    {
      title: "11. Disclaimers",
      paragraphs: [
        "THE PLATFORM IS PROVIDED “AS IS” AND “AS AVAILABLE”. To the fullest extent permitted by law, we disclaim warranties of uninterrupted availability, error-free operation, and fitness for a particular purpose.",
        "We do not endorse every seller or listing. Any reliance on listings, chat statements, or off-platform payment arrangements is at your own risk.",
      ],
    },
    {
      title: "12. Limitation of liability",
      paragraphs: [
        "To the fullest extent permitted by law, JBH is not liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, data, or goodwill, arising from your use of the Platform or from transactions between users.",
        "Our total liability for claims relating to the Platform in any twelve-month period is limited to the fees (if any) you paid to JBH for optional Platform services in that period, or BDT 5,000 if you paid no such fees—except where liability cannot be limited under applicable law (for example proven fraud or wilful misconduct by us).",
      ],
    },
    {
      title: "13. Indemnity",
      paragraphs: [
        "You agree to indemnify and hold harmless JBH and its officers from claims arising out of your listings, orders, content, misuse of the Platform, or breach of these Terms, to the extent permitted by law.",
      ],
    },
    {
      title: "14. Suspension and termination",
      paragraphs: [
        "You may stop using the Platform at any time. We may suspend or terminate access for breach of these Terms or for operational/legal reasons. Provisions that by nature should survive (including liability limits, indemnity, and IP) will survive termination.",
      ],
    },
    {
      title: "15. Changes to the Terms",
      paragraphs: [
        "We may update these Terms. The last updated date will change when we do. Continued use after changes take effect constitutes acceptance, except where additional consent is required by law.",
      ],
    },
    {
      title: "16. Governing law",
      paragraphs: [
        "These Terms are governed by the laws of Bangladesh. Courts in Bangladesh shall have jurisdiction, without limiting any mandatory consumer or business protections that cannot be waived.",
      ],
    },
    {
      title: "17. Contact",
      paragraphs: [
        `${LEGAL_COMPANY}`,
        `Email: ${LEGAL_CONTACT_EMAIL}`,
      ],
    },
  ],
  sectionsBn: [
    {
      title: "১. চুক্তি",
      paragraphs: [
        `এই শর্তাবলী ${LEGAL_COMPANY}-এর মোবাইল অ্যাপ ও ওয়েবসাইট মার্কেটপ্লেস (“প্ল্যাটফর্ম”) ব্যবহার নিয়ন্ত্রণ করে। অ্যাকাউন্ট তৈরি বা ব্যবহারের মাধ্যমে আপনি এই শর্তাবলী ও প্রাইভেসি পলিসিতে সম্মত হন।`,
      ],
    },
    {
      title: "২. প্ল্যাটফর্মের ভূমিকা",
      paragraphs: [
        "JBH পাইকারি ও খুচরা ব্যবসাকে সংযুক্ত করার প্রযুক্তি সরবরাহ করে। আমরা সাধারণত ক্রেতা বা বিক্রেতা নই এবং পণ্যের মালিকানা গ্রহণ করি না—বিক্রয় চুক্তি ব্যবহারকারীদের মধ্যে। বিক্রেতা গুণমান, বৈধতা ও সরবরাহের জন্য দায়ী; ক্রেতা তালিকা যাচাই ও পারস্পরিক সম্মতিতে পেমেন্টের জন্য দায়ী।",
      ],
    },
    {
      title: "৩. যোগ্যতা ও অ্যাকাউন্ট",
      paragraphs: [
        "আপনার বয়স কমপক্ষে ১৮ এবং বাংলাদেশের আইনে চুক্তি করার যোগ্যতা থাকতে হবে। সঠিক তথ্য দিন এবং লগইন সুরক্ষিত রাখুন। দোকানের ধরন (পাইকারি/খুচরা) ভুল উপস্থাপন শর্তভঙ্গ।",
      ],
    },
    {
      title: "৪. তালিকা, মূল্য ও ভ্যাট",
      paragraphs: [
        "বিক্রেতা বেস (ভ্যাট ছাড়া) ইউনিট মূল্য লিখেন। ক্রেতা দেখানো ও চেকআউটে বর্তমানে পাইকারি বিক্রেতার বেসে ১০% এবং খুচরা বিক্রেতার বেসে ১৫% ভ্যাট যোগ হয় (আমরা ভিন্ন হার প্রকাশ না করলে)। অর্ডারের সময় সার্ভার-নির্ধারিত ভ্যাটসহ মূল্য প্রযোজ্য; সম্পন্ন অর্ডারের স্ন্যাপশট পরে পরিবর্তন হয় না।",
      ],
    },
    {
      title: "৫. অর্ডার, বাতিল ও রিভিউ",
      paragraphs: [
        "অর্ডার ক্রেতা-বিক্রেতার মধ্যে অনুরোধ তৈরি করে। বাতিল ও স্ট্যাটাস অ্যাপ/ওয়েব প্রক্রিয়া অনুসরণ করে। যোগ্য অর্ডারের পর সৎ রিভিউ দেওয়া যায়; অপমানজনক রিভিউ সরানো হতে পারে।",
      ],
    },
    {
      title: "৬. মেসেজ, নোটিফিকেশন, ব্লক ও রিপোর্ট",
      paragraphs: [
        "চ্যাট ও নোটিফিকেশন মার্কেটপ্লেস যোগাযোগের জন্য। স্প্যাম, হয়রানি বা অবৈধ বিষয়বস্তু নিষিদ্ধ। ব্লক/রিপোর্ট করা যায়; ফলাফল নিশ্চিত নয়।",
      ],
    },
    {
      title: "৭. Restricted ও Freeze",
      paragraphs: [
        "নীতিভঙ্গ, জালিয়াতি ঝুঁকি বা অন্য গুরুতর কারণে অ্যাকাউন্ট restricted বা freeze করা হতে পারে। Restricted-এ সাধারণত লিস্টিং বন্ধ; freeze-এ ক্রয়/বিক্রয়/মেসেজিং সীমিত হতে পারে। পাবলিক তালিকা লুকানো হতে পারে।",
      ],
    },
    {
      title: "৮. ঐচ্ছিক সেবা",
      paragraphs: [
        "বিজ্ঞাপন, ফিচার্ড স্টোর ও রেফারেল প্রোগ্রাম অতিরিক্ত নির্দেশনা ও অনুমোদনের অধীনে চলতে পারে। প্ল্যাটফর্ম ফি ব্যবস্থা সময়ের সাথে পরিবর্তন হতে পারে।",
      ],
    },
    {
      title: "৯. নিষিদ্ধ আচরণ",
      paragraphs: [
        "আইন ভাঙা, নকল/নিষিদ্ধ পণ্য, আইপি লঙ্ঘন, হ্যাকিং, ভুয়া অ্যাকাউন্ট, পর্যালোচনা/মূল্য কারসাজি, হয়রানি বা প্রতারণা নিষিদ্ধ।",
      ],
    },
    {
      title: "১০. দায় ও সীমাবদ্ধতা",
      paragraphs: [
        "প্ল্যাটফর্ম “যেমন আছে” ভিত্তিতে দেওয়া হয়। আইনে অনুমোদিত সর্বোচ্চ সীমায়, ব্যবহারকারীদের মধ্যে লেনদেন বা প্ল্যাটফর্ম ব্যবহারজনিত পরোক্ষ ক্ষতির জন্য JBH দায়ী নয়। কিছু দাবি সীমিত করা যায় না যেখানে আইন নিষেধ করে।",
      ],
    },
    {
      title: "১১. আইন ও যোগাযোগ",
      paragraphs: [
        "এই শর্তাবলী বাংলাদেশের আইন দ্বারা পরিচালিত।",
        `${LEGAL_COMPANY}`,
        `ইমেইল: ${LEGAL_CONTACT_EMAIL}`,
      ],
    },
  ],
};
