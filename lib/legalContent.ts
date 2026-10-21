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
        `${LEGAL_COMPANY} (“JBH”, “আমরা”, “আমাদের”) মোবাইল অ্যাপ্লিকেশন ও ওয়েবসাইটের মাধ্যমে একটি বি২বি পোশাক মার্কেটপ্লেস পরিচালনা করে (একত্রে “প্ল্যাটফর্ম”)। এই প্রাইভেসি পলিসিতে ব্যাখ্যা করা হয়েছে আমরা কী ব্যক্তিগত তথ্য সংগ্রহ করি, কীভাবে ব্যবহার করি এবং আপনার কী পছন্দ/অধিকার আছে।`,
        `গোপনীয়তা সংক্রান্ত যোগাযোগ: ${LEGAL_CONTACT_EMAIL}।`,
      ],
    },
    {
      title: "২. পরিধি",
      paragraphs: [
        "এই নীতি আমাদের অ্যাপ ও ওয়েবসাইট ব্যবহারকারী অ্যাকাউন্ট ও ভিজিটরদের জন্য প্রযোজ্য—পাইকারি বিক্রেতা, খুচরা ক্রেতা ও অন্যান্য নিবন্ধিত ব্যবহারকারীসহ। অ্যাকাউন্ট তৈরি বা প্ল্যাটফর্ম ব্যবহারের মাধ্যমে আপনি এই নীতি স্বীকার করেন।",
      ],
    },
    {
      title: "৩. আমরা যে তথ্য সংগ্রহ করি",
      paragraphs: [
        "অ্যাকাউন্ট ও প্রোফাইল তথ্য: নাম, ইমেইল, ফোন নম্বর, পাসওয়ার্ড (আমাদের অথ প্রদানকারীর মাধ্যমে সুরক্ষিতভাবে সংরক্ষিত), অবতার, দোকানের নাম, দোকানের ধরন (পাইকারি বা খুচরা), ব্যবসা/দোকানের ঠিকানা (জেলা, উপজেলা, ঠিকানা) এবং অ্যাকাউন্ট স্ট্যাটাস (যেমন active, restricted বা freeze)।",
        "ডেলিভারি তথ্য: সংরক্ষিত ডেলিভারি ঠিকানা এবং আপনার দেওয়া অর্ডারে সংরক্ষিত শহর/ঠিকানার স্ন্যাপশট।",
        "মার্কেটপ্লেস কার্যক্রম: পণ্য তালিকা (নাম, বর্ণনা, ছবি, আপনি যে বেস/ভ্যাট-ছাড়া মূল্য লিখেন, MOQ, স্টক/ভ্যারিয়েন্ট), অর্ডার ও অর্ডার লাইনের স্ন্যাপশট (পরিমাণ, বেস মূল্য, ভ্যাট হার, ভ্যাট পরিমাণ এবং ভ্যাটসহ ইউনিট মূল্যসহ), রিভিউ, রেটিং ও সংশ্লিষ্ট নোটিফিকেশন।",
        "যোগাযোগ: ইন-অ্যাপ চ্যাট মেসেজ, সাপোর্ট অনুরোধ, ব্যবহারকারী বা তালিকা সম্পর্কে রিপোর্ট এবং আপনি তৈরি করা ব্লক সম্পর্ক।",
        "প্রমোশন ও প্রবৃদ্ধি: পণ্য বিজ্ঞাপনের অনুরোধ, ফিচার্ড-স্টোর অনুরোধ এবং রেফারেল / কনটেন্ট-ক্রিয়েটর সংক্রান্ত আবেদনের তথ্য (আপনি অংশ নিলে)।",
        "ডিভাইস ও প্রযুক্তিগত তথ্য: পুশ নোটিফিকেশন টোকেন, নোটিফিকেশন পৌঁছানোর জন্য প্রয়োজনীয় আনুমানিক ডিভাইস/অ্যাপ শনাক্তকারী, আমাদের সার্ভার ও হোস্টিং প্রদানকারীর আইপি ঠিকানা ও মৌলিক লগ এবং আপনার ডিভাইসে সংরক্ষিত স্থানীয় পছন্দ (যেমন ক্যাটালগ ফিল্টার)।",
        "ক্রেতা–বিক্রেতা নিষ্পত্তির জন্য আমরা ইচ্ছাকৃতভাবে প্ল্যাটফর্মে পেমেন্ট কার্ড নম্বর সংগ্রহ করি না। ক্রেতা ও বিক্রেতার মধ্যে যেকোনো পেমেন্ট সেই পক্ষগুলোর মধ্যেই হয়, কোনো নির্দিষ্ট ফিচারের জন্য আমরা স্পষ্টভাবে অন্য কিছু না বললে।",
      ],
    },
    {
      title: "৪. আপনার তথ্য কীভাবে ব্যবহার করি",
      paragraphs: [
        "আপনার অ্যাকাউন্ট তৈরি ও পরিচালনা করতে, বিক্রয় বা ক্রয় সুবিধার যোগ্যতা যাচাই করতে এবং নিরাপত্তা, কমপ্লায়েন্স বা নীতি প্রয়োগের প্রয়োজনে restricted বা freeze-এর মতো অ্যাকাউন্ট স্ট্যাটাস প্রয়োগ করতে।",
        "মার্কেটপ্লেস পরিচালনা করতে: তালিকা দেখানো (খুচরা/পাইকারি ফিল্টারসহ), ক্রেতাদের জন্য ভ্যাটসহ মূল্য হিসাব ও প্রদর্শন (বর্তমানে পাইকারি বিক্রেতার বেস মূল্যে ১০% এবং খুচরা বিক্রেতার বেস মূল্যে ১৫%), অর্ডার প্রক্রিয়া করা, অর্ডার ইভেন্টের নোটিফিকেশন পাঠানো এবং রেকর্ডের জন্য আর্থিক স্ন্যাপশট রাখা।",
        "মেসেজিং, নোটিফিকেশন (পুশ ও ইন-অ্যাপসহ), সাপোর্ট, রিভিউ, ব্লকিং ও রিপোর্টিং সক্ষম করতে।",
        "আপনি যোগ দেওয়া ঐচ্ছিক প্রমোশন (বিজ্ঞাপন, ফিচার্ড স্টোর) ও রেফারেল প্রোগ্রাম প্রক্রিয়া করতে।",
        "প্ল্যাটফর্ম সুরক্ষিত করতে, জালিয়াতি ও অপব্যবহার প্রতিরোধ করতে, সমস্যা ডিবাগ করতে, পারফরম্যান্স উন্নত করতে এবং প্রযোজ্য আইন মেনে চলতে।",
        "আপনার অ্যাকাউন্ট, অর্ডার, নীতি হালনাগাদ বা সেবা বার্তা সম্পর্কে আপনার সাথে যোগাযোগ করতে। কোনো মার্কেটিং বার্তা থাকলে প্রযোজ্য নিয়ম ও প্রয়োজনীয় ক্ষেত্রে আপনার পছন্দ অনুসরণ করবে।",
      ],
    },
    {
      title: "৫. আইনি ভিত্তি ও শেয়ারিং",
      paragraphs: [
        "আমরা আপনার সাথে আমাদের চুক্তি পালন (প্ল্যাটফর্ম সরবরাহ), বৈধ স্বার্থ (নিরাপত্তা, পণ্য উন্নয়ন, মার্কেটপ্লেস অখণ্ডতা) এবং আইনে প্রয়োজন হলে তথ্য প্রক্রিয়া করি।",
        "আমরা তথ্য শেয়ার করি: (ক) মার্কেটপ্লেস কার্যক্রমের জন্য প্রয়োজনীয় অন্য ব্যবহারকারীদের সাথে (যেমন পূরণের জন্য বিক্রেতা ক্রেতার অর্ডার/যোগাযোগ তথ্য দেখতে পারে; ক্রেতা পাবলিক স্টোর ও তালিকার তথ্য দেখে); (খ) আমাদের নির্দেশে তথ্য প্রক্রিয়াকারী সেবা প্রদানকারীদের সাথে (হোস্টিং, ডাটাবেস, অথেন্টিকেশন, ফাইল স্টোরেজ, ইমেইল ডেলিভারি, পুশ নোটিফিকেশন, সক্রিয় থাকলে অ্যানালিটিক্স); (গ) আইনত প্রয়োজন হলে কর্তৃপক্ষের সাথে; এবং (ঘ) গোপনীয়তার অধীনে পেশাদার উপদেষ্টাদের সাথে।",
        "আমরা আপনার ব্যক্তিগত তথ্য বিক্রি করি না।",
      ],
    },
    {
      title: "৬. অ্যাকাউন্ট স্ট্যাটাস, মডারেশন ও দৃশ্যমানতা",
      paragraphs: [
        "আমরা অ্যাকাউন্টকে restricted বা frozen চিহ্নিত করতে পারি। Restricted অ্যাকাউন্টে বিক্রয় বা তালিকা সুবিধা হারাতে পারে, যদিও কিছু ক্রেতা সুবিধা থাকতে পারে। Frozen অ্যাকাউন্টে স্ট্যাটাস তোলা না পর্যন্ত ক্রয়, বিক্রয়, মেসেজিং ও সংশ্লিষ্ট সুবিধা হারাতে পারে।",
        "দেখানোর যোগ্য নয় এমন বিক্রেতার পাবলিক তালিকা ব্রাউজ ও সার্চ থেকে লুকানো হতে পারে। রেকর্ড ও বিরোধ নিষ্পত্তির জন্য অর্ডার ও চ্যাট ইতিহাস সংরক্ষিত থাকতে পারে।",
      ],
    },
    {
      title: "৭. সংরক্ষণ",
      paragraphs: [
        "আপনার অ্যাকাউন্ট সক্রিয় থাকাকালীন এবং পরে আইনি, কর, হিসাবরক্ষণ, বিরোধ ও নিরাপত্তার প্রয়োজনে যতক্ষণ দরকার ততক্ষণ অ্যাকাউন্ট ও লেনদেনের তথ্য রাখি। অর্ডার লাইনের ভ্যাট ও মূল্য স্ন্যাপশট অর্ডার রেকর্ডের অংশ হিসেবে সংরক্ষিত হয়। আইনি সংরক্ষণের প্রয়োজন সাপেক্ষে আপনি মুছে ফেলার অনুরোধ করতে পারেন; কিছু তথ্য সীমিত সময়ের জন্য ব্যাকআপে থাকতে পারে।",
      ],
    },
    {
      title: "৮. নিরাপত্তা",
      paragraphs: [
        "আমরা যুক্তিসঙ্গত প্রযুক্তিগত ও সাংগঠনিক ব্যবস্থা ব্যবহার করি (প্রযোজ্য ক্ষেত্রে অ্যাক্সেস নিয়ন্ত্রণ ও এনক্রিপ্টেড ট্রান্সপোর্টসহ)। কোনো প্রেরণ বা সংরক্ষণ পদ্ধতিই ১০০% নিরাপদ নয়। অনুগ্রহ করে লগইন তথ্য সুরক্ষিত রাখুন এবং সন্দেহজনক অননুমোদিত প্রবেশ আমাদের জানান।",
      ],
    },
    {
      title: "৯. আপনার পছন্দ ও অধিকার",
      paragraphs: [
        "আপনি অ্যাপ বা ওয়েবসাইটে প্রোফাইল ও ডেলিভারি তথ্যের অনেক অংশ হালনাগাদ করতে পারেন। ডিভাইসে কিছু নোটিফিকেশন পছন্দ নিয়ন্ত্রণ করতে পারেন। ইমেইল করে ব্যক্তিগত তথ্যের অ্যাক্সেস, সংশোধন বা মুছে ফেলা অথবা গোপনীয়তা সংক্রান্ত উদ্বেগ জানাতে পারেন। অনুরোধে ব্যবস্থা নেওয়ার আগে আমরা আপনার পরিচয় যাচাই করতে পারি।",
      ],
    },
    {
      title: "১০. শিশু",
      paragraphs: [
        "প্ল্যাটফর্ম ব্যবসায়িক ব্যবহারকারীদের জন্য। এটি ১৮ বছরের কম বয়সী শিশুদের উদ্দেশ্যে নয়। কোনো শিশু ব্যক্তিগত তথ্য দিয়েছে বলে মনে হলে আমাদের যোগাযোগ করুন; আমরা যথাযথ পদক্ষেপ নেব।",
      ],
    },
    {
      title: "১১. আন্তর্জাতিক প্রক্রিয়াকরণ",
      paragraphs: [
        "আমাদের সেবা প্রদানকারীরা বাংলাদেশের বাইরের দেশে তথ্য প্রক্রিয়া করতে পারে। তথ্য স্থানান্তর করলে আমরা সেবা সম্পর্ক ও প্রযোজ্য আইন অনুযায়ী উপযুক্ত পদক্ষেপ নিই।",
      ],
    },
    {
      title: "১২. পরিবর্তন",
      paragraphs: [
        "আমরা এই প্রাইভেসি পলিসি হালনাগাদ করতে পারি। করলে “Last updated” তারিখ পরিবর্তন হবে। গুরুত্বপূর্ণ পরিবর্তন অ্যাপ, ওয়েবসাইট বা ইমেইলেও জানানো হতে পারে। পরিবর্তনের কার্যকর তারিখের পর ব্যবহার চালিয়ে যাওয়া মানে আপনি হালনাগাদ নীতি গ্রহণ করেছেন, যেখানে আইনে অতিরিক্ত সম্মতি প্রয়োজন সেখানে ব্যতীত।",
      ],
    },
    {
      title: "১৩. যোগাযোগ",
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
        "Store type matters: wholesale accounts may list products and manage sales; any signed-in account type may place purchase orders unless frozen. Misrepresenting your store type or business details is a breach of these Terms.",
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
        `এই শর্তাবলী (“শর্তাবলী”) ${LEGAL_COMPANY}-এর মোবাইল অ্যাপ ও ওয়েবসাইটের মাধ্যমে উপলব্ধ মার্কেটপ্লেস (“প্ল্যাটফর্ম”) ব্যবহার নিয়ন্ত্রণ করে। অ্যাকাউন্ট তৈরি বা প্ল্যাটফর্ম ব্যবহারের মাধ্যমে আপনি এই শর্তাবলী ও আমাদের প্রাইভেসি পলিসিতে সম্মত হন।`,
        "আপনি সম্মত না হলে প্ল্যাটফর্ম ব্যবহার করবেন না।",
      ],
    },
    {
      title: "২. প্ল্যাটফর্ম (মার্কেটপ্লেসের ভূমিকা)",
      paragraphs: [
        "JBH পাইকারি ও খুচরা পোশাক ব্যবসাকে সংযুক্ত করার প্রযুক্তি সরবরাহ করে। কোনো নির্দিষ্ট লেনদেনের জন্য লিখিতভাবে অন্য কিছু না বলা পর্যন্ত, JBH তালিকাভুক্ত পণ্যের ক্রেতা বা বিক্রেতা নয়, পণ্যের মালিকানা গ্রহণ করে না এবং ব্যবহারকারীদের মধ্যে বিক্রয় চুক্তির পক্ষ নয়।",
        "বিক্রেতারা পণ্যের গুণমান, বৈধতা, স্টকের সঠিকতা, সরবরাহ, বিক্রয়োত্তর বিষয় এবং তারা যে ওয়ারেন্টি দেন তার জন্য দায়ী। ক্রেতারা তালিকা পর্যালোচনা, উপযুক্ততা নিশ্চিতকরণ এবং পক্ষগুলোর মধ্যে সম্মতভাবে বিক্রেতাকে পেমেন্টের জন্য দায়ী।",
      ],
    },
    {
      title: "৩. যোগ্যতা ও অ্যাকাউন্ট",
      paragraphs: [
        "আপনার বয়স কমপক্ষে ১৮ বছর হতে হবে এবং বাংলাদেশের আইনে বাধ্যবাধক চুক্তি করার যোগ্যতা থাকতে হবে। নিবন্ধন ও দোকানের সঠিক তথ্য দিতে হবে এবং হালনাগাদ রাখতে হবে।",
        "লগইন তথ্য সুরক্ষিত রাখা এবং আপনার অ্যাকাউন্টের অধীনে সংঘটিত কার্যকলাপের দায়িত্ব আপনার। অননুমোদিত ব্যবহার হলে দ্রুত আমাদের জানান।",
        "দোকানের ধরন গুরুত্বপূর্ণ: পাইকারি অ্যাকাউন্ট পণ্য তালিকা ও বিক্রয় পরিচালনা করতে পারে; সাইন-ইন করা যেকোনো অ্যাকাউন্ট টাইপ (freeze না হলে) ক্রয় অর্ডার দিতে পারে। দোকানের ধরন বা ব্যবসার তথ্য ভুল উপস্থাপন এই শর্তাবলীর লঙ্ঘন।",
      ],
    },
    {
      title: "৪. তালিকা, মূল্য ও ভ্যাট",
      paragraphs: [
        "বিক্রেতারা প্রতিটি পণ্যের জন্য বেস (ভ্যাট ছাড়া) ইউনিট মূল্য লিখেন। ক্রেতা দেখানো ও চেকআউটে প্ল্যাটফর্ম সেই বেসের উপর ভ্যাট প্রয়োগ করে: বর্তমানে বিক্রেতার দোকানের ধরন পাইকারি হলে ১০% এবং খুচরা হলে ১৫% (আমরা ভিন্ন হার প্রকাশ না করলে)।",
        "অর্ডারের জন্য চার্জকৃত পরিমাণ অর্ডারের সময় আমাদের সার্ভার কর্তৃক গণনাকৃত ভ্যাটসহ ইউনিট মূল্য ব্যবহার করে। অর্ডার রেকর্ডে বেস মূল্য, ভ্যাট হার, ভ্যাট পরিমাণ ও ভ্যাটসহ মূল্যের স্ন্যাপশট থাকতে পারে। পরে পণ্যের বেস মূল্য পরিবর্তন সম্পন্ন অর্ডার পরিবর্তন করে না।",
        "মূল্য, স্টক, MOQ, ছবি ও বর্ণনা সঠিক ও আইনসম্মত হতে হবে। আইন, এই শর্তাবলী বা মার্কেটপ্লেস মান লঙ্ঘনকারী তালিকা আমরা সরাতে বা লুকাতে পারি।",
      ],
    },
    {
      title: "৫. অর্ডার, বাতিল ও রিভিউ",
      paragraphs: [
        "অর্ডার দেওয়া প্ল্যাটফর্মের মাধ্যমে ক্রেতা ও বিক্রেতার মধ্যে অনুরোধ তৈরি করে। অর্ডার স্ট্যাটাস (যেমন pending, processing, shipped, completed, cancelled বা hold) আমাদের প্রবাহ এবং বিক্রেতা/ক্রেতার কার্যক্রম অনুযায়ী আপডেট হতে পারে।",
        "বাতিল অনুরোধ ও অনুমোদন অ্যাপ/ওয়েবসাইটের প্রক্রিয়া অনুসরণ করে। নিরাপত্তা, জালিয়াতি বা অপব্যবহারের জন্য আমরা হস্তক্ষেপ করতে পারি, তবে প্রতিটি বাণিজ্যিক বিরোধ মধ্যস্থতা করতে বাধ্য নই।",
        "যোগ্য সম্পন্ন অর্ডারের পর ক্রেতাদের রিভিউ দিতে বলা হতে পারে। রিভিউ সৎ ও অপমানমুক্ত হতে হবে। এই শর্তাবলী লঙ্ঘনকারী রিভিউ আমরা সরাতে পারি।",
      ],
    },
    {
      title: "৬. মেসেজিং, নোটিফিকেশন, ব্লক ও রিপোর্ট",
      paragraphs: [
        "মার্কেটপ্লেস যোগাযোগ সহায়তার জন্য চ্যাট ও নোটিফিকেশন (সক্রিয় থাকলে পুশ নোটিফিকেশনসহ) দেওয়া হয়। স্প্যাম, হয়রানি, প্রতারণা বা অবৈধ বিষয়বস্তুর জন্য মেসেজিং ব্যবহার করবেন না।",
        "আপনি অন্য ব্যবহারকারীকে ব্লক করতে বা রিপোর্ট জমা দিতে পারেন। আমরা তদন্ত করে ব্যবস্থা নিতে পারি, তবে নির্দিষ্ট ফলাফল বা সময়সীমার নিশ্চয়তা দিই না।",
      ],
    },
    {
      title: "৭. অ্যাকাউন্ট সীমাবদ্ধতা ও ফ্রিজ",
      paragraphs: [
        "নীতিভঙ্গ, জালিয়াতির ঝুঁকি, আইনি ঝুঁকি, অপব্যবহার, ঐচ্ছিক প্ল্যাটফর্ম সেবা সংক্রান্ত অপরিশোধিত দায়, অসম্পূর্ণ যাচাই বা অন্য গুরুতর উদ্বেগ যুক্তিসঙ্গতভাবে মনে হলে আমরা অ্যাকাউন্টকে restricted বা freeze (বা অন্যভাবে সীমিত) করতে পারি।",
        "Restricted অ্যাকাউন্টে সাধারণত বিক্রেতা হিসেবে তালিকা আপলোড বা পরিচালনা করা যায় না, যদিও কিছু ক্রেতা সুবিধা থাকতে পারে। Frozen অ্যাকাউন্টে স্ট্যাটাস তোলা না পর্যন্ত সাধারণত অর্ডার, বিক্রয় বা মেসেজিং ব্যবহার করা যায় না। অযোগ্য বিক্রেতার পাবলিক তালিকা লুকানো হতে পারে।",
        "আমরা অ্যাকাউন্ট পুনর্বহাল, আরও সীমিত বা স্থায়ীভাবে বাতিল করতে পারি। সীমাবদ্ধতা বা ফ্রিজের আগে অন্য ব্যবহারকারীর প্রতি আপনার বকেয়া দায়িত্ব থেকে যায়।",
      ],
    },
    {
      title: "৮. ঐচ্ছিক সেবা",
      paragraphs: [
        "পণ্য বিজ্ঞাপন, ফিচার্ড স্টোর প্লেসমেন্ট এবং রেফারেল / কনটেন্ট-ক্রিয়েটর প্রোগ্রামের মতো সুবিধা অনুরোধ প্রবাহে দেখানো অতিরিক্ত নির্দেশনার অধীনে দেওয়া হতে পারে। সেই সেবার ফি, মেয়াদ ও অনুমোদনের সিদ্ধান্ত অনুরোধের সময় যেমন বলা হয় তেমনই, এবং আমরা গ্রহণ বা প্রত্যাখ্যান করতে পারি।",
        "প্ল্যাটফর্ম ফি বা “due amount” সংগ্রহের সুবিধা সময়ের সাথে পরিবর্তন হতে পারে; কোনো ফি প্রোগ্রাম সক্রিয় না থাকলেও অন্যান্য শর্তাবলী বাতিল হয় না।",
      ],
    },
    {
      title: "৯. নিষিদ্ধ আচরণ",
      paragraphs: [
        "আপনি পারবেন না: প্রযোজ্য আইন ভাঙা; নিষিদ্ধ বা নকল পণ্য তালিকাভুক্ত করা; মেধাস্বত্ব লঙ্ঘন; প্ল্যাটফর্ম স্ক্র্যাপ বা আক্রমণ; নিরাপত্তা বা অ্যাক্সেস নিয়ন্ত্রণ এড়ানো; অসৎভাবে মূল্য, স্টক, রিভিউ বা র‍্যাঙ্কিং কারসাজি; অন্যদের হয়রানি; ভুয়া অ্যাকাউন্ট তৈরি; বা প্রতারণা সহায়তায় প্ল্যাটফর্ম ব্যবহার।",
      ],
    },
    {
      title: "১০. মেধাস্বত্ব",
      paragraphs: [
        "ব্যবহারকারীর কনটেন্ট বাদে প্ল্যাটফর্ম সফটওয়্যার, ব্র্যান্ডিং ও সংশ্লিষ্ট উপকরণ JBH-এর। আপনি আপলোড করা কনটেন্টের অধিকার রাখেন এবং মার্কেটপ্লেস পরিচালনা ও প্রচারের জন্য সেই কনটেন্ট হোস্ট, প্রদর্শন ও ব্যবহারের অ-একচেটিয়া লাইসেন্স JBH-কে দেন।",
        "আপনি নিশ্চিত করেন যে আপলোড করা ছবি ও লেখার অধিকার আপনার আছে।",
      ],
    },
    {
      title: "১১. দাবিত্যাগ",
      paragraphs: [
        "প্ল্যাটফর্ম “যেমন আছে” এবং “যেমন উপলব্ধ” ভিত্তিতে দেওয়া হয়। আইনে অনুমোদিত সর্বোচ্চ সীমায়, নিরবচ্ছিন্ন উপলব্ধতা, ত্রুটিমুক্ত পরিচালনা বা নির্দিষ্ট উদ্দেশ্যে উপযোগিতার ওয়ারেন্টি আমরা অস্বীকার করি।",
        "আমরা প্রতিটি বিক্রেতা বা তালিকা অনুমোদন করি না। তালিকা, চ্যাট বক্তব্য বা প্ল্যাটফর্ম-বহির্ভূত পেমেন্ট ব্যবস্থার উপর নির্ভর আপনার নিজ ঝুঁকিতে।",
      ],
    },
    {
      title: "১২. দায়বদ্ধতার সীমা",
      paragraphs: [
        "আইনে অনুমোদিত সর্বোচ্চ সীমায়, প্ল্যাটফর্ম ব্যবহার বা ব্যবহারকারীদের মধ্যে লেনদেন থেকে উদ্ভূত পরোক্ষ, আনুষঙ্গিক, বিশেষ, ফলস্বরূপ বা শাস্তিমূলক ক্ষতি, বা মুনাফা/ডেটা/সুনাম হারানোর জন্য JBH দায়ী নয়।",
        "যেকোনো বারো মাসের সময়কালে প্ল্যাটফর্ম সম্পর্কিত দাবিতে আমাদের মোট দায় সেই সময়ে ঐচ্ছিক প্ল্যাটফর্ম সেবার জন্য আপনি JBH-কে যে ফি (যদি থাকে) দিয়েছেন তাতে সীমাবদ্ধ, অথবা কোনো ফি না দিলে BDT ৫,০০০—যেখানে প্রযোজ্য আইনে দায় সীমিত করা যায় না (যেমন আমাদের প্রমাণিত প্রতারণা বা ইচ্ছাকৃত অসদাচরণ) সেখানে ব্যতীত।",
      ],
    },
    {
      title: "১৩. ক্ষতিপূরণ",
      paragraphs: [
        "আইনে অনুমোদিত সীমায়, আপনার তালিকা, অর্ডার, কনটেন্ট, প্ল্যাটফর্মের অপব্যবহার বা এই শর্তাবলী লঙ্ঘন থেকে উদ্ভূত দাবির জন্য আপনি JBH ও এর কর্মকর্তাদের ক্ষতিপূরণ দিতে এবং ক্ষতিমুক্ত রাখতে সম্মত।",
      ],
    },
    {
      title: "১৪. স্থগিতকরণ ও সমাপ্তি",
      paragraphs: [
        "আপনি যেকোনো সময় প্ল্যাটফর্ম ব্যবহার বন্ধ করতে পারেন। শর্তাবলী লঙ্ঘন বা পরিচালনাগত/আইনি কারণে আমরা অ্যাক্সেস স্থগিত বা সমাপ্ত করতে পারি। স্বভাবতই টিকে থাকা বিধান (দায় সীমা, ক্ষতিপূরণ ও আইপিসহ) সমাপ্তির পরও বহাল থাকবে।",
      ],
    },
    {
      title: "১৫. শর্তাবলীর পরিবর্তন",
      paragraphs: [
        "আমরা এই শর্তাবলী হালনাগাদ করতে পারি। করলে “Last updated” তারিখ পরিবর্তন হবে। পরিবর্তন কার্যকর হওয়ার পর ব্যবহার চালিয়ে যাওয়া গ্রহণযোগ্যতা বলে গণ্য, যেখানে আইনে অতিরিক্ত সম্মতি প্রয়োজন সেখানে ব্যতীত।",
      ],
    },
    {
      title: "১৬. প্রযোজ্য আইন",
      paragraphs: [
        "এই শর্তাবলী বাংলাদেশের আইন দ্বারা পরিচালিত। বাংলাদেশের আদালতের এখতিয়ার থাকবে, তবে যে বাধ্যতামূলক ভোক্তা বা ব্যবসায়িক সুরক্ষা ত্যাগ করা যায় না তা সীমিত না করে।",
      ],
    },
    {
      title: "১৭. যোগাযোগ",
      paragraphs: [
        `${LEGAL_COMPANY}`,
        `ইমেইল: ${LEGAL_CONTACT_EMAIL}`,
      ],
    },
  ],
};
