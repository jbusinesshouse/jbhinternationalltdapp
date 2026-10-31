/**
 * Canonical Privacy Policy & Terms for JBH International Limited.
 * Keep in sync with j-business-house/lib/legalContent.ts (the app and the website show the same text).
 *
 * When you change what the Platform collects or how pricing/fees work, update this file in BOTH
 * projects and bump LEGAL_LAST_UPDATED.
 */

export const LEGAL_CONTACT_EMAIL = "marketplace@jbhinternationallimited.com";
export const LEGAL_COMPANY = "JBH International Limited";
export const LEGAL_ADDRESS_EN = "Ahmed Tower, Banani, Dhaka, Bangladesh";
export const LEGAL_ADDRESS_BN = "আহমেদ টাওয়ার, বনানী, ঢাকা, বাংলাদেশ";
export const LEGAL_EFFECTIVE_DATE = "31 October 2026";
export const LEGAL_LAST_UPDATED = "31 October 2026";

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
        `${LEGAL_COMPANY} (“JBH”, “we”, “us”, or “our”) operates a B2B clothing marketplace through our Android mobile app and our website (together, the “Platform”). This Privacy Policy explains what personal data we collect, why, who can see it, and the choices you have.`,
        `Our address: ${LEGAL_ADDRESS_EN}. Contact for privacy questions: ${LEGAL_CONTACT_EMAIL}.`,
      ],
    },
    {
      title: "2. Scope",
      paragraphs: [
        "This Policy applies to everyone who uses the Platform: registered users (wholesale sellers, retail sellers and buyers), visitors who only browse, and people who place an order on the website without creating an account. It also covers the emails and push notifications we send. By creating an account, placing an order, or using the Platform, you acknowledge this Policy.",
      ],
    },
    {
      title: "3. Information we collect",
      paragraphs: [
        "Account and profile data: name, email address, phone number, password (handled by our authentication provider and never visible to us in readable form), profile photo, store name, store type (wholesale or retail), store address (district, upazila, address), referral code you enter at sign-up, and your account status (for example active, restricted, or freeze). Wholesale accounts are reviewed by us before selling is switched on.",
        "Photos you choose: the app asks for access to your photo library only when you pick a picture (for a profile photo, product images, or review photos). We do not browse your gallery, and the app does not use your camera, location, contacts, or microphone. Images are reduced in size on your device before upload. Pictures you upload to listings, profiles, and reviews can be opened by anyone who has the image link.",
        "Delivery and order data: saved delivery addresses; and, for each order, your name, phone number, email (if given), city and delivery address, the items, sizes, colours and quantities, and price records (base price, VAT rate, VAT amount, and VAT-inclusive price).",
        "Ordering without an account (website): if you order as a guest we collect your name, mobile number, optional email, and delivery address. We send a one-time code by SMS to confirm your number. The code is stored only in a scrambled (hashed) form, expires within minutes, and is used once. We create a limited buyer record tied to your phone number so the order can be handled. The Android app currently requires an account to order.",
        "Marketplace activity: product listings you create (names, descriptions, images, prices you enter as base/ex-VAT amounts, MOQ, stock and variants), reviews and ratings, and related notifications.",
        "Communications: chat messages between users, support requests, reports you make about users or listings (reason and any details you add), and the list of users you block.",
        "Promotions and referrals: product advertisement requests, featured-store requests, and, if you apply to be a referral / content-creator partner, your name, phone number, social platform, profile link, follower count and message.",
        "Device and technical data: your push-notification token, the platform (Android or iOS) and device model, so we can deliver notifications; the app version (to offer updates); IP address, browser or device details and basic request logs on our servers; and short-lived security records such as failed verification attempts.",
        "Stored on your device or browser: your sign-in session, and your catalogue filter choices. The website uses essential cookies to keep you signed in. We do not use advertising cookies, and we do not currently use third-party analytics or advertising trackers.",
        "Email records: we use your account email to send service messages and, sometimes, announcements. We keep a list of email addresses that unsubscribed or could not be reached so we can respect that choice. For announcement campaigns we also record the name and email address of recipients and whether each message was sent.",
        "We do not collect payment card numbers on the Platform. Payments for orders are arranged between buyers and sellers unless we clearly say otherwise for a specific feature.",
      ],
    },
    {
      title: "4. How we use your information",
      paragraphs: [
        "To create and manage your account, check eligibility to sell or buy, and apply account statuses (restricted or freeze) when needed for safety, compliance, or policy enforcement.",
        "To run the marketplace: show listings (including wholesale/retail filters), calculate and show VAT-inclusive prices to buyers (currently 10% on wholesale sellers’ base prices and 15% on retail sellers’ base prices), process orders, tell the people involved about order events, and keep price and VAT records.",
        "To let you chat, receive notifications (push and in-app), contact support, leave reviews, block users, and report problems.",
        "To process optional promotions (ads, featured stores) and referral partnerships you choose to join, including showing referral partners a limited summary of people who joined with their code.",
        "To confirm your phone number by SMS when you order as a guest, and to prevent misuse of that feature.",
        "To send you service messages (orders, account, policy changes) and, where allowed, announcements by email. Every announcement email has an unsubscribe link.",
        "To keep the Platform secure, prevent fraud and abuse, fix problems, improve performance, and comply with the law.",
      ],
    },
    {
      title: "5. Who can see your information",
      paragraphs: [
        "Public information: a seller’s store page is visible to anyone, including without an account. It shows the store name, photo, the seller’s name, district, upazila and store address, and the listings. Reviews show the reviewer’s name and photo, rating, comment, and any review photos.",
        "Between buyers and sellers: when you place an order, the seller sees your name, phone number, email (if given), and delivery address so they can fulfil it. You can see the seller’s store details and contact number for that order.",
        "Referral partners: if you register with a referral code, that partner can see a summary that includes your display name (store name or name), account type, and join date. They do not see your phone, email, or address.",
        "Service providers that process data for us, under our instructions: Supabase (database, sign-in, and file storage), Resend (email delivery), Expo’s push notification service together with Google (Android) and Apple (iOS) notification systems, a provider that sends SMS codes for website guest orders, Google Play (app update checks), and our hosting providers. Our team can also see account, order, report and support information in internal admin tools in order to provide support and moderate the Platform.",
        "Others: authorities when the law requires it, and professional advisers under confidentiality.",
        "We do not sell your personal data and we do not share it with advertisers.",
      ],
    },
    {
      title: "6. Account status, moderation, and visibility",
      paragraphs: [
        "We may mark accounts as restricted or frozen. New wholesale accounts start as restricted until we approve them. Restricted accounts may lose selling or listing privileges while some buyer features can remain. Frozen accounts may lose buying, selling, messaging, and related privileges until we lift the status.",
        "Listings from sellers who are not eligible to be shown may be hidden from browsing and search. Order and chat history may still be kept for records and dispute handling.",
      ],
    },
    {
      title: "7. How long we keep data",
      paragraphs: [
        "We keep account and transaction data while your account is active and afterwards as needed for legal, tax, accounting, dispute, and security purposes. Order price and VAT records are kept as part of order records.",
        "One-time SMS codes are short-lived and are removed or become unusable soon after they expire. Push tokens are switched off when you sign out or when a device stops accepting them. If you unsubscribe from emails, we keep your email address on a do-not-email list so we do not email you again.",
        "You can ask us to delete your account (see section 9). Some data may be kept where the law or a legitimate need (for example a dispute or fraud prevention) requires it, and some data may remain in backups for a limited period.",
      ],
    },
    {
      title: "8. Security",
      paragraphs: [
        "We use reasonable technical and organisational measures, including access controls, encrypted connections, and limited staff access. No method of transmission or storage is 100% secure. Please keep your login details private and tell us if you suspect unauthorised access.",
      ],
    },
    {
      title: "9. Your choices and rights",
      paragraphs: [
        "You can update most profile and delivery details in the app or on the website, and change notification settings in your device settings. Every announcement email includes an unsubscribe link, and service emails about your orders will still be sent.",
        "To close your account, use “Close account” in your profile in the app or on the website. It takes you to a request form hosted on Google Forms, so Google also processes what you type there. You can also email us. You can ask for access to, correction of, or deletion of your personal data, or raise a privacy concern, at the email below. We may need to confirm your identity before acting.",
      ],
    },
    {
      title: "10. Children",
      paragraphs: [
        "The Platform is intended for business users and is not directed at anyone under 18. If you believe a child has given us personal data, contact us and we will take appropriate steps.",
      ],
    },
    {
      title: "11. International processing",
      paragraphs: [
        "Some of our service providers may process data in countries other than Bangladesh. Where we transfer data, we take steps appropriate to the service and applicable law.",
      ],
    },
    {
      title: "12. Changes",
      paragraphs: [
        "We may update this Privacy Policy when the Platform or the law changes. The “Last updated” date will change when we do. Important changes may also be shown in the app, on the website, or by email. Continuing to use the Platform after the changes take effect means you accept the updated Policy, except where the law requires additional consent.",
      ],
    },
    {
      title: "13. Contact",
      paragraphs: [
        `${LEGAL_COMPANY}`,
        `Address: ${LEGAL_ADDRESS_EN}`,
        `Email: ${LEGAL_CONTACT_EMAIL}`,
      ],
    },
  ],
  sectionsBn: [
    {
      title: "১. আমরা কারা",
      paragraphs: [
        `${LEGAL_COMPANY} (“JBH”, “আমরা”, “আমাদের”) আমাদের অ্যান্ড্রয়েড মোবাইল অ্যাপ ও ওয়েবসাইটের মাধ্যমে একটি বি২বি পোশাক মার্কেটপ্লেস পরিচালনা করে (একত্রে “প্ল্যাটফর্ম”)। এই প্রাইভেসি পলিসিতে ব্যাখ্যা করা হয়েছে আমরা কী ব্যক্তিগত তথ্য সংগ্রহ করি, কেন করি, কারা তা দেখতে পারে এবং আপনার কী কী পছন্দ আছে।`,
        `আমাদের ঠিকানা: ${LEGAL_ADDRESS_BN}। গোপনীয়তা সংক্রান্ত যোগাযোগ: ${LEGAL_CONTACT_EMAIL}।`,
      ],
    },
    {
      title: "২. পরিধি",
      paragraphs: [
        "এই নীতি প্ল্যাটফর্মের সবার জন্য প্রযোজ্য: নিবন্ধিত ব্যবহারকারী (পাইকারি সেলার, খুচরা সেলার ও ক্রেতা), যারা শুধু ঘুরে দেখেন এমন ভিজিটর, এবং যারা অ্যাকাউন্ট না খুলে ওয়েবসাইটে অর্ডার করেন। আমরা যে ইমেইল ও পুশ নোটিফিকেশন পাঠাই সেগুলোও এর আওতায়। অ্যাকাউন্ট খুলে, অর্ডার করে বা প্ল্যাটফর্ম ব্যবহার করে আপনি এই নীতি স্বীকার করেন।",
      ],
    },
    {
      title: "৩. আমরা যে তথ্য সংগ্রহ করি",
      paragraphs: [
        "অ্যাকাউন্ট ও প্রোফাইল তথ্য: নাম, ইমেইল, ফোন নম্বর, পাসওয়ার্ড (আমাদের অথেন্টিকেশন প্রদানকারী এটি সামলায়; আমরা পড়ার মতো আকারে দেখতে পাই না), প্রোফাইল ছবি, দোকানের নাম, দোকানের ধরন (পাইকারি বা খুচরা), দোকানের ঠিকানা (জেলা, উপজেলা, ঠিকানা), সাইন আপের সময় দেওয়া রেফারেল কোড এবং অ্যাকাউন্ট স্ট্যাটাস (যেমন active, restricted বা freeze)। বিক্রি চালু করার আগে পাইকারি অ্যাকাউন্ট আমরা যাচাই করি।",
        "আপনার বাছাই করা ছবি: প্রোফাইল ছবি, পণ্যের ছবি বা রিভিউয়ের ছবি দেওয়ার সময়ই কেবল অ্যাপ আপনার ফটো লাইব্রেরিতে প্রবেশের অনুমতি চায়। আমরা আপনার গ্যালারি ঘেঁটে দেখি না, আর অ্যাপ আপনার ক্যামেরা, লোকেশন, কন্টাক্ট বা মাইক্রোফোন ব্যবহার করে না। আপলোডের আগে ছবি আপনার ডিভাইসেই ছোট করা হয়। তালিকা, প্রোফাইল ও রিভিউয়ে আপলোড করা ছবির লিংক যার কাছে আছে সে-ই ছবিটি খুলতে পারে।",
        "ডেলিভারি ও অর্ডার তথ্য: সংরক্ষিত ডেলিভারি ঠিকানা; এবং প্রতিটি অর্ডারে আপনার নাম, ফোন নম্বর, ইমেইল (দিলে), শহর ও ডেলিভারি ঠিকানা, পণ্য, সাইজ, রং ও পরিমাণ এবং মূল্যের রেকর্ড (বেস মূল্য, ভ্যাট হার, ভ্যাটের পরিমাণ ও ভ্যাটসহ মূল্য)।",
        "অ্যাকাউন্ট ছাড়া অর্ডার (ওয়েবসাইট): অতিথি হিসেবে অর্ডার করলে আমরা আপনার নাম, মোবাইল নম্বর, ঐচ্ছিক ইমেইল ও ডেলিভারি ঠিকানা নিই। আপনার নম্বর নিশ্চিত করতে SMS-এ একটি এককালীন কোড পাঠাই। কোডটি শুধু এলোমেলো (হ্যাশ) আকারে রাখা হয়, কয়েক মিনিটেই মেয়াদ শেষ হয় এবং একবারই ব্যবহার করা যায়। অর্ডার সামলানোর জন্য আপনার ফোন নম্বরের সাথে যুক্ত একটি সীমিত ক্রেতা-রেকর্ড তৈরি হয়। অ্যান্ড্রয়েড অ্যাপে এখন অর্ডার করতে অ্যাকাউন্ট লাগে।",
        "মার্কেটপ্লেস কার্যক্রম: আপনার তৈরি পণ্য তালিকা (নাম, বর্ণনা, ছবি, আপনার লেখা বেস/ভ্যাট-ছাড়া মূল্য, MOQ, স্টক ও ভ্যারিয়েন্ট), রিভিউ ও রেটিং এবং সংশ্লিষ্ট নোটিফিকেশন।",
        "যোগাযোগ: ব্যবহারকারীদের মধ্যে চ্যাট মেসেজ, সাপোর্ট অনুরোধ, কোনো ব্যবহারকারী বা তালিকা সম্পর্কে আপনার রিপোর্ট (কারণ ও আপনার দেওয়া বিবরণ) এবং আপনার ব্লক করা ব্যবহারকারীদের তালিকা।",
        "প্রমোশন ও রেফারেল: পণ্য বিজ্ঞাপনের অনুরোধ, ফিচার্ড-স্টোর অনুরোধ এবং রেফারেল / কনটেন্ট-ক্রিয়েটর পার্টনার হতে আবেদন করলে আপনার নাম, ফোন নম্বর, সোশ্যাল প্ল্যাটফর্ম, প্রোফাইল লিংক, ফলোয়ার সংখ্যা ও বার্তা।",
        "ডিভাইস ও প্রযুক্তিগত তথ্য: নোটিফিকেশন পাঠানোর জন্য আপনার পুশ-নোটিফিকেশন টোকেন, প্ল্যাটফর্ম (অ্যান্ড্রয়েড বা আইওএস) ও ডিভাইসের মডেল; আপডেট দেখানোর জন্য অ্যাপের সংস্করণ; আমাদের সার্ভারে আইপি ঠিকানা, ব্রাউজার বা ডিভাইসের তথ্য ও মৌলিক রিকোয়েস্ট লগ; এবং ব্যর্থ ভেরিফিকেশন চেষ্টার মতো স্বল্পস্থায়ী নিরাপত্তা রেকর্ড।",
        "আপনার ডিভাইস বা ব্রাউজারে যা থাকে: আপনার সাইন-ইন সেশন এবং ক্যাটালগ ফিল্টারের পছন্দ। ওয়েবসাইট আপনাকে সাইন ইন রাখতে প্রয়োজনীয় কুকি ব্যবহার করে। আমরা বিজ্ঞাপনের কুকি ব্যবহার করি না এবং এখন তৃতীয় পক্ষের অ্যানালিটিক্স বা বিজ্ঞাপন ট্র্যাকার ব্যবহার করি না।",
        "ইমেইল রেকর্ড: আমরা আপনার অ্যাকাউন্টের ইমেইলে সার্ভিস বার্তা এবং মাঝে মাঝে ঘোষণা পাঠাই। যারা আনসাবস্ক্রাইব করেছেন বা যাদের কাছে ইমেইল পৌঁছায়নি তাদের ঠিকানার একটি তালিকা রাখি, যাতে সেই সিদ্ধান্তকে সম্মান করা যায়। ঘোষণা-ক্যাম্পেইনে প্রাপকের নাম, ইমেইল এবং প্রতিটি বার্তা পাঠানো হয়েছে কি না তাও রেকর্ড করি।",
        "আমরা প্ল্যাটফর্মে পেমেন্ট কার্ড নম্বর সংগ্রহ করি না। অর্ডারের পেমেন্ট ক্রেতা ও বিক্রেতার মধ্যে ঠিক হয়, কোনো নির্দিষ্ট ফিচারের জন্য আমরা স্পষ্টভাবে অন্য কিছু না বললে।",
      ],
    },
    {
      title: "৪. আপনার তথ্য কীভাবে ব্যবহার করি",
      paragraphs: [
        "আপনার অ্যাকাউন্ট তৈরি ও পরিচালনা করতে, বিক্রি বা কেনার যোগ্যতা যাচাই করতে এবং নিরাপত্তা, কমপ্লায়েন্স বা নীতি প্রয়োগের প্রয়োজনে restricted বা freeze স্ট্যাটাস দিতে।",
        "মার্কেটপ্লেস চালাতে: তালিকা দেখানো (পাইকারি/খুচরা ফিল্টারসহ), ক্রেতাদের জন্য ভ্যাটসহ মূল্য হিসাব ও প্রদর্শন (বর্তমানে পাইকারি সেলারের বেস মূল্যে ১০% এবং খুচরা সেলারের বেস মূল্যে ১৫%), অর্ডার প্রক্রিয়া করা, সংশ্লিষ্টদের অর্ডারের ঘটনা জানানো এবং মূল্য ও ভ্যাটের রেকর্ড রাখা।",
        "চ্যাট, নোটিফিকেশন (পুশ ও ইন-অ্যাপ), সাপোর্ট, রিভিউ, ব্লক ও সমস্যা রিপোর্টের সুবিধা দিতে।",
        "আপনি যে ঐচ্ছিক প্রমোশন (বিজ্ঞাপন, ফিচার্ড স্টোর) ও রেফারেল পার্টনারশিপে যোগ দেন তা প্রক্রিয়া করতে — রেফারেল পার্টনারদের তাদের কোডে যোগ দেওয়া ব্যক্তিদের একটি সীমিত সারসংক্ষেপ দেখানোসহ।",
        "অতিথি হিসেবে অর্ডার করলে SMS-এ আপনার ফোন নম্বর নিশ্চিত করতে এবং এই সুবিধার অপব্যবহার ঠেকাতে।",
        "আপনাকে সার্ভিস বার্তা (অর্ডার, অ্যাকাউন্ট, নীতির পরিবর্তন) এবং যেখানে অনুমোদিত সেখানে ইমেইলে ঘোষণা পাঠাতে। প্রতিটি ঘোষণা-ইমেইলে আনসাবস্ক্রাইব লিংক থাকে।",
        "প্ল্যাটফর্ম নিরাপদ রাখতে, জালিয়াতি ও অপব্যবহার ঠেকাতে, সমস্যা সারাতে, পারফরম্যান্স ভালো করতে এবং আইন মানতে।",
      ],
    },
    {
      title: "৫. আপনার তথ্য কারা দেখতে পারে",
      paragraphs: [
        "প্রকাশ্য তথ্য: সেলারের স্টোর পেজ অ্যাকাউন্ট ছাড়াও যে কেউ দেখতে পারে। সেখানে স্টোরের নাম, ছবি, সেলারের নাম, জেলা, উপজেলা ও দোকানের ঠিকানা এবং তালিকাভুক্ত পণ্য থাকে। রিভিউয়ে রিভিউদাতার নাম ও ছবি, রেটিং, মন্তব্য এবং রিভিউয়ের ছবি দেখা যায়।",
        "ক্রেতা ও সেলারের মধ্যে: আপনি অর্ডার করলে সেলার তা পূরণ করতে আপনার নাম, ফোন নম্বর, ইমেইল (দিলে) ও ডেলিভারি ঠিকানা দেখতে পান। আপনি সেই অর্ডারের জন্য সেলারের স্টোরের তথ্য ও যোগাযোগের নম্বর দেখতে পান।",
        "রেফারেল পার্টনার: আপনি রেফারেল কোড দিয়ে নিবন্ধন করলে সেই পার্টনার আপনার প্রদর্শন-নাম (দোকানের নাম বা নাম), অ্যাকাউন্টের ধরন ও যোগ দেওয়ার তারিখসহ একটি সারসংক্ষেপ দেখতে পান। আপনার ফোন, ইমেইল বা ঠিকানা তারা দেখেন না।",
        "আমাদের নির্দেশে যে সেবা প্রদানকারীরা তথ্য প্রক্রিয়া করে: Supabase (ডাটাবেস, সাইন-ইন ও ফাইল স্টোরেজ), Resend (ইমেইল পাঠানো), Expo-র পুশ নোটিফিকেশন সার্ভিস এবং তার সাথে Google (অ্যান্ড্রয়েড) ও Apple (আইওএস)-এর নোটিফিকেশন ব্যবস্থা, ওয়েবসাইটের অতিথি অর্ডারের SMS কোড পাঠানোর একটি প্রদানকারী, Google Play (অ্যাপ আপডেট যাচাই) এবং আমাদের হোস্টিং প্রদানকারী। সাপোর্ট দিতে ও প্ল্যাটফর্ম মডারেট করতে আমাদের টিম অভ্যন্তরীণ অ্যাডমিন টুলে অ্যাকাউন্ট, অর্ডার, রিপোর্ট ও সাপোর্টের তথ্য দেখতে পারে।",
        "অন্যান্য: আইনে বাধ্য হলে সরকারি কর্তৃপক্ষ এবং গোপনীয়তার শর্তে পেশাদার উপদেষ্টা।",
        "আমরা আপনার ব্যক্তিগত তথ্য বিক্রি করি না এবং বিজ্ঞাপনদাতাদের সাথে শেয়ার করি না।",
      ],
    },
    {
      title: "৬. অ্যাকাউন্ট স্ট্যাটাস, মডারেশন ও দৃশ্যমানতা",
      paragraphs: [
        "আমরা অ্যাকাউন্টকে restricted বা frozen করতে পারি। নতুন পাইকারি অ্যাকাউন্ট আমরা অনুমোদন না করা পর্যন্ত restricted থাকে। Restricted অ্যাকাউন্টে বিক্রি বা তালিকা করার সুবিধা না-ও থাকতে পারে, যদিও কিছু ক্রেতা-সুবিধা থাকে। Frozen অ্যাকাউন্টে স্ট্যাটাস না তোলা পর্যন্ত কেনা, বিক্রি, মেসেজ ও সংশ্লিষ্ট সুবিধা বন্ধ থাকতে পারে।",
        "দেখানোর যোগ্য নয় এমন সেলারের তালিকা ব্রাউজ ও সার্চ থেকে লুকানো হতে পারে। রেকর্ড ও বিরোধ নিষ্পত্তির জন্য অর্ডার ও চ্যাটের ইতিহাস তবুও রাখা হতে পারে।",
      ],
    },
    {
      title: "৭. কতদিন তথ্য রাখি",
      paragraphs: [
        "আপনার অ্যাকাউন্ট সক্রিয় থাকাকালীন এবং তারপর আইনি, কর, হিসাব, বিরোধ ও নিরাপত্তার প্রয়োজনে যতটুকু দরকার ততদিন অ্যাকাউন্ট ও লেনদেনের তথ্য রাখি। অর্ডারের মূল্য ও ভ্যাটের রেকর্ড অর্ডার রেকর্ডের অংশ হিসেবে থাকে।",
        "এককালীন SMS কোড স্বল্পস্থায়ী; মেয়াদ শেষের অল্প পরেই তা মুছে যায় বা অকার্যকর হয়। আপনি সাইন আউট করলে বা কোনো ডিভাইস নোটিফিকেশন নেওয়া বন্ধ করলে পুশ টোকেন বন্ধ করে দেওয়া হয়। আপনি ইমেইল আনসাবস্ক্রাইব করলে আপনাকে আর ইমেইল না পাঠাতে আপনার ঠিকানা একটি “ইমেইল পাঠানো যাবে না” তালিকায় রাখি।",
        "আপনি অ্যাকাউন্ট মুছে ফেলার অনুরোধ করতে পারেন (ধারা ৯ দেখুন)। আইন বা বৈধ প্রয়োজন (যেমন বিরোধ বা জালিয়াতি প্রতিরোধ) থাকলে কিছু তথ্য রাখতে হতে পারে এবং কিছু তথ্য সীমিত সময়ের জন্য ব্যাকআপে থাকতে পারে।",
      ],
    },
    {
      title: "৮. নিরাপত্তা",
      paragraphs: [
        "আমরা যুক্তিসঙ্গত প্রযুক্তিগত ও সাংগঠনিক ব্যবস্থা নিই — অ্যাক্সেস নিয়ন্ত্রণ, এনক্রিপ্টেড সংযোগ ও সীমিত কর্মী-প্রবেশসহ। কোনো প্রেরণ বা সংরক্ষণ পদ্ধতিই ১০০% নিরাপদ নয়। অনুগ্রহ করে লগইন তথ্য গোপন রাখুন এবং অননুমোদিত প্রবেশের সন্দেহ হলে আমাদের জানান।",
      ],
    },
    {
      title: "৯. আপনার পছন্দ ও অধিকার",
      paragraphs: [
        "আপনি অ্যাপ বা ওয়েবসাইটে প্রোফাইল ও ডেলিভারি তথ্যের বেশিরভাগ হালনাগাদ করতে পারেন এবং ডিভাইসের সেটিংসে নোটিফিকেশনের পছন্দ বদলাতে পারেন। প্রতিটি ঘোষণা-ইমেইলে আনসাবস্ক্রাইব লিংক থাকে; আপনার অর্ডার সংক্রান্ত সার্ভিস ইমেইল তবুও যাবে।",
        "অ্যাকাউন্ট বন্ধ করতে অ্যাপ বা ওয়েবসাইটে প্রোফাইলে “অ্যাকাউন্ট বন্ধ” ব্যবহার করুন। এটি আপনাকে Google Forms-এ হোস্ট করা একটি অনুরোধ ফর্মে নিয়ে যায়, তাই সেখানে আপনি যা লেখেন তা Google-ও প্রক্রিয়া করে। আপনি আমাদের ইমেইলও করতে পারেন। নিচের ইমেইলে আপনি আপনার ব্যক্তিগত তথ্য দেখা, সংশোধন বা মুছে ফেলার অনুরোধ অথবা গোপনীয়তা সংক্রান্ত উদ্বেগ জানাতে পারেন। ব্যবস্থা নেওয়ার আগে আমরা আপনার পরিচয় নিশ্চিত করতে পারি।",
      ],
    },
    {
      title: "১০. শিশু",
      paragraphs: [
        "প্ল্যাটফর্ম ব্যবসায়িক ব্যবহারকারীদের জন্য, ১৮ বছরের কমদের উদ্দেশ্যে নয়। কোনো শিশু আমাদের ব্যক্তিগত তথ্য দিয়েছে বলে মনে হলে আমাদের জানান; আমরা যথাযথ ব্যবস্থা নেব।",
      ],
    },
    {
      title: "১১. আন্তর্জাতিক প্রক্রিয়াকরণ",
      paragraphs: [
        "আমাদের কিছু সেবা প্রদানকারী বাংলাদেশের বাইরের দেশে তথ্য প্রক্রিয়া করতে পারে। তথ্য স্থানান্তর হলে আমরা সেবা ও প্রযোজ্য আইন অনুযায়ী উপযুক্ত পদক্ষেপ নিই।",
      ],
    },
    {
      title: "১২. পরিবর্তন",
      paragraphs: [
        "প্ল্যাটফর্ম বা আইন বদলালে আমরা এই প্রাইভেসি পলিসি হালনাগাদ করতে পারি। করলে “Last updated” তারিখ বদলাবে। গুরুত্বপূর্ণ পরিবর্তন অ্যাপ, ওয়েবসাইট বা ইমেইলেও জানানো হতে পারে। পরিবর্তন কার্যকর হওয়ার পর প্ল্যাটফর্ম ব্যবহার চালিয়ে গেলে আপনি হালনাগাদ নীতি মেনে নিয়েছেন ধরা হবে; আইনে অতিরিক্ত সম্মতি লাগলে তা আলাদা।",
      ],
    },
    {
      title: "১৩. যোগাযোগ",
      paragraphs: [
        `${LEGAL_COMPANY}`,
        `ঠিকানা: ${LEGAL_ADDRESS_BN}`,
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
        `These Terms & Conditions (“Terms”) govern your use of the ${LEGAL_COMPANY} marketplace available through our Android app and website (the “Platform”). By creating an account, placing an order (including an order without an account), or otherwise using the Platform, you agree to these Terms and our Privacy Policy.`,
        "If you do not agree, do not use the Platform.",
      ],
    },
    {
      title: "2. The Platform (marketplace role)",
      paragraphs: [
        "JBH provides technology that connects clothing wholesalers, retail sellers and buyers. Unless we expressly say otherwise in writing for a specific transaction, JBH is not the buyer or seller of listed goods, does not take ownership of them, and is not a party to the sales contract between users.",
        "Sellers are responsible for product quality, legality, accurate stock, fulfilment, after-sales issues, and any warranties they give. Buyers are responsible for reading listings, checking suitability, and paying sellers as agreed between them. JBH does not currently collect payment for orders through the Platform.",
      ],
    },
    {
      title: "3. Eligibility and accounts",
      paragraphs: [
        "You must be at least 18 and able to enter a binding contract under the laws of Bangladesh. You must give accurate registration and store information and keep it up to date.",
        "You are responsible for keeping your login details safe and for activity under your account. Tell us promptly about any unauthorised use.",
        "Account types: wholesale and retail seller accounts may list products. New wholesale accounts start as restricted and can sell only after we approve them. Wholesale sellers can manage incoming sales orders. Any signed-in account may place orders unless it is frozen.",
        "Ordering without an account: where we offer it on the website, you may place an order by confirming your mobile number with a one-time SMS code. You must use your own number, give accurate details, and keep the code private. The same Terms apply to guest orders. Misrepresenting your account type, identity, or business details breaches these Terms.",
      ],
    },
    {
      title: "4. Listings, pricing, and VAT",
      paragraphs: [
        "Sellers enter a base (ex-VAT) unit price for each product. For buyers, the Platform adds VAT on top of that base price: currently 10% where the seller’s store type is wholesale and 15% where it is retail, unless we publish a different rate. The VAT is shown to buyers as part of the order price.",
        "JBH does not currently deduct any commission or fee from a seller’s base price for sales made through the Platform. We may introduce or change fees in future; if we do, we will update these Terms and tell sellers before the change applies.",
        "The amount charged for an order is the VAT-inclusive unit price calculated by our servers when the order is placed. Order records keep the base price, VAT rate, VAT amount, and inclusive price. Changing a product’s base price later does not change orders already placed.",
        "Each listing has a minimum order quantity (MOQ). Wholesale listings need an MOQ of at least 6; retail listings at least 1. Buyers must order at least the MOQ.",
        "Prices, stock, MOQ, images, and descriptions must be accurate and lawful. We may remove or hide listings that break the law, these Terms, or marketplace standards.",
      ],
    },
    {
      title: "5. Orders, cancellations, and reviews",
      paragraphs: [
        "Placing an order sends a request to the seller through the Platform. Order statuses (pending, processing, shipped, completed, cancelled, or hold) are updated through the Platform by the seller and by the cancellation flow below.",
        "A seller may ask to cancel an order; the order is cancelled only if the buyer accepts. If the buyer declines, the order is put on hold. We may step in for safety, fraud, or abuse, but we are not required to resolve every commercial dispute.",
        "After an order is completed, the buyer may leave one review with a rating, comment, and photos. Reviews must be honest and respectful, and they show your name and photo publicly. We may remove reviews that break these Terms.",
      ],
    },
    {
      title: "6. Messaging, notifications, email, blocking, and reports",
      paragraphs: [
        "Chat, push and in-app notifications, and emails are provided to support marketplace communication. Do not use them for spam, harassment, scams, or illegal content. We send service emails about your account and orders, and may send announcements that you can unsubscribe from at any time.",
        "You may block other users or report users and listings. We may investigate and act, but we cannot promise a particular outcome or response time.",
      ],
    },
    {
      title: "7. Account restriction and freeze",
      paragraphs: [
        "We may set an account to restricted or freeze (or otherwise limit access) if we reasonably believe there is a policy breach, fraud risk, legal risk, abuse, unpaid amounts for optional Platform services, incomplete verification, or another serious concern.",
        "Restricted accounts usually cannot upload or manage listings while some buyer features may remain. Frozen accounts usually cannot place orders, sell, or use messaging until the status is lifted. Listings from ineligible sellers may be hidden.",
        "We may reinstate, further limit, or permanently close accounts. You remain responsible for obligations to other users that arose before the restriction or freeze.",
      ],
    },
    {
      title: "8. Optional services",
      paragraphs: [
        "Features such as product advertisements, featured-store placement, and referral / content-creator programmes may be offered under extra instructions shown in the request screens. The price, duration, and our approval decision for these services are as stated when you apply, and we may accept or decline a request.",
        "Promotions do not guarantee any number of views, orders, or sales.",
      ],
    },
    {
      title: "9. Prohibited conduct",
      paragraphs: [
        "You must not: break the law; list prohibited or counterfeit goods; infringe intellectual property; scrape or attack the Platform; bypass security or access controls; use another person’s phone number or identity to order; misuse the SMS verification; manipulate prices, stock, reviews, or rankings dishonestly; harass others; create fake accounts; or use the Platform to help carry out fraud.",
      ],
    },
    {
      title: "10. Intellectual property",
      paragraphs: [
        "JBH owns the Platform’s software, branding, and related materials (excluding user content). You keep your rights in content you upload and give JBH a non-exclusive licence to host, display, and use that content to run and promote the marketplace.",
        "You confirm that you have the rights to the images and text you upload. If you believe a listing infringes your rights, email us at the address below with the listing and details of your claim, and we may remove it.",
      ],
    },
    {
      title: "11. Disclaimers",
      paragraphs: [
        "THE PLATFORM IS PROVIDED “AS IS” AND “AS AVAILABLE”. To the fullest extent the law permits, we do not promise uninterrupted availability, error-free operation, or fitness for a particular purpose.",
        "We do not endorse every seller or listing. Relying on listings, chat statements, or payment arrangements made outside the Platform is at your own risk.",
      ],
    },
    {
      title: "12. Limitation of liability",
      paragraphs: [
        "To the fullest extent the law permits, JBH is not liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, data, or goodwill, arising from your use of the Platform or from dealings between users.",
        "Our total liability for claims relating to the Platform in any twelve-month period is limited to the fees (if any) you paid JBH for optional Platform services in that period, or BDT 5,000 if you paid no such fees — except where liability cannot be limited by law (for example our proven fraud or wilful misconduct).",
      ],
    },
    {
      title: "13. Indemnity",
      paragraphs: [
        "You agree to indemnify and hold harmless JBH and its officers from claims arising out of your listings, orders, content, misuse of the Platform, or breach of these Terms, to the extent the law allows.",
      ],
    },
    {
      title: "14. Suspension and termination",
      paragraphs: [
        "You may stop using the Platform at any time and can ask us to close your account as described in the Privacy Policy. We may suspend or end access for breach of these Terms or for operational or legal reasons. Provisions that by their nature should continue (including liability limits, indemnity, and intellectual property) continue after termination.",
      ],
    },
    {
      title: "15. Changes to the Terms",
      paragraphs: [
        "We may update these Terms. The “Last updated” date will change when we do, and important changes may be shown in the app, on the website, or by email. Continuing to use the Platform after changes take effect means you accept them, except where the law requires additional consent.",
      ],
    },
    {
      title: "16. Governing law",
      paragraphs: [
        "These Terms are governed by the laws of Bangladesh. The courts of Bangladesh have jurisdiction, without limiting any mandatory consumer or business protections that cannot be waived.",
      ],
    },
    {
      title: "17. Contact",
      paragraphs: [
        `${LEGAL_COMPANY}`,
        `Address: ${LEGAL_ADDRESS_EN}`,
        `Email: ${LEGAL_CONTACT_EMAIL}`,
      ],
    },
  ],
  sectionsBn: [
    {
      title: "১. চুক্তি",
      paragraphs: [
        `এই শর্তাবলী (“শর্তাবলী”) আমাদের অ্যান্ড্রয়েড অ্যাপ ও ওয়েবসাইটের মাধ্যমে উপলব্ধ ${LEGAL_COMPANY} মার্কেটপ্লেস (“প্ল্যাটফর্ম”) ব্যবহার নিয়ন্ত্রণ করে। অ্যাকাউন্ট খুলে, অর্ডার করে (অ্যাকাউন্ট ছাড়া অর্ডারসহ) বা অন্যভাবে প্ল্যাটফর্ম ব্যবহার করে আপনি এই শর্তাবলী ও আমাদের প্রাইভেসি পলিসিতে সম্মত হন।`,
        "আপনি সম্মত না হলে প্ল্যাটফর্ম ব্যবহার করবেন না।",
      ],
    },
    {
      title: "২. প্ল্যাটফর্ম (মার্কেটপ্লেসের ভূমিকা)",
      paragraphs: [
        "JBH এমন প্রযুক্তি দেয় যা পোশাকের পাইকারি বিক্রেতা, খুচরা সেলার ও ক্রেতাদের যুক্ত করে। কোনো নির্দিষ্ট লেনদেনের জন্য আমরা লিখিতভাবে অন্য কিছু না বললে, JBH তালিকাভুক্ত পণ্যের ক্রেতা বা বিক্রেতা নয়, পণ্যের মালিকানা নেয় না এবং ব্যবহারকারীদের মধ্যকার বিক্রয়চুক্তির পক্ষ নয়।",
        "পণ্যের মান, বৈধতা, স্টকের সঠিকতা, সরবরাহ, বিক্রয়-পরবর্তী সমস্যা এবং তাদের দেওয়া ওয়ারেন্টির দায় সেলারদের। তালিকা পড়া, উপযুক্ততা যাচাই এবং নিজেদের মধ্যে ঠিক করা অনুযায়ী সেলারকে পেমেন্ট করার দায় ক্রেতার। JBH এখন প্ল্যাটফর্মের মাধ্যমে অর্ডারের পেমেন্ট সংগ্রহ করে না।",
      ],
    },
    {
      title: "৩. যোগ্যতা ও অ্যাকাউন্ট",
      paragraphs: [
        "আপনার বয়স কমপক্ষে ১৮ হতে হবে এবং বাংলাদেশের আইনে বাধ্যতামূলক চুক্তি করার সামর্থ্য থাকতে হবে। নিবন্ধন ও দোকানের সঠিক তথ্য দিতে হবে এবং তা হালনাগাদ রাখতে হবে।",
        "লগইন তথ্য নিরাপদ রাখার এবং আপনার অ্যাকাউন্টের সব কার্যক্রমের দায় আপনার। অননুমোদিত ব্যবহার হলে দ্রুত আমাদের জানান।",
        "অ্যাকাউন্টের ধরন: পাইকারি ও খুচরা — দুই ধরনের সেলার অ্যাকাউন্টই পণ্য তালিকাভুক্ত করতে পারে। নতুন পাইকারি অ্যাকাউন্ট restricted অবস্থায় শুরু হয় এবং আমরা অনুমোদন দিলেই বিক্রি করতে পারে। পাইকারি সেলাররা আসা সেলস অর্ডার ম্যানেজ করতে পারেন। সাইন ইন করা যেকোনো অ্যাকাউন্ট অর্ডার করতে পারে, ফ্রিজ করা না থাকলে।",
        "অ্যাকাউন্ট ছাড়া অর্ডার: ওয়েবসাইটে আমরা যেখানে এটি দিই, সেখানে এককালীন SMS কোড দিয়ে মোবাইল নম্বর নিশ্চিত করে অর্ডার করা যায়। আপনাকে নিজের নম্বর ব্যবহার করতে, সঠিক তথ্য দিতে এবং কোড গোপন রাখতে হবে। অতিথি অর্ডারেও একই শর্তাবলী প্রযোজ্য। অ্যাকাউন্টের ধরন, পরিচয় বা ব্যবসার তথ্য ভুলভাবে উপস্থাপন করা এই শর্তাবলী ভঙ্গ।",
      ],
    },
    {
      title: "৪. তালিকা, মূল্য ও ভ্যাট",
      paragraphs: [
        "সেলাররা প্রতিটি পণ্যের জন্য বেস (ভ্যাট ছাড়া) ইউনিট মূল্য লেখেন। ক্রেতার জন্য প্ল্যাটফর্ম সেই বেস মূল্যের উপরে ভ্যাট যোগ করে: বর্তমানে সেলারের দোকানের ধরন পাইকারি হলে ১০% এবং খুচরা হলে ১৫% (আমরা ভিন্ন হার প্রকাশ না করলে)। ভ্যাট ক্রেতাকে অর্ডারের মূল্যের অংশ হিসেবে দেখানো হয়।",
        "প্ল্যাটফর্মের মাধ্যমে হওয়া বিক্রিতে JBH এখন সেলারের বেস মূল্য থেকে কোনো কমিশন বা ফি কাটে না। ভবিষ্যতে ফি চালু বা পরিবর্তন হলে আমরা এই শর্তাবলী হালনাগাদ করব এবং তা কার্যকর হওয়ার আগে সেলারদের জানাব।",
        "অর্ডারের জন্য যে অঙ্ক নেওয়া হয় তা অর্ডারের সময় আমাদের সার্ভারের হিসাব করা ভ্যাটসহ ইউনিট মূল্য। অর্ডার রেকর্ডে বেস মূল্য, ভ্যাট হার, ভ্যাটের পরিমাণ ও ভ্যাটসহ মূল্য থাকে। পরে পণ্যের বেস মূল্য বদলালে আগে হয়ে যাওয়া অর্ডার বদলায় না।",
        "প্রতিটি তালিকায় একটি সর্বনিম্ন অর্ডার পরিমাণ (MOQ) থাকে। পাইকারি তালিকায় MOQ কমপক্ষে ৬ এবং খুচরা তালিকায় কমপক্ষে ১। ক্রেতাকে অন্তত MOQ-এর সমান অর্ডার করতে হবে।",
        "মূল্য, স্টক, MOQ, ছবি ও বর্ণনা সঠিক ও বৈধ হতে হবে। আইন, এই শর্তাবলী বা মার্কেটপ্লেসের মান ভঙ্গ করলে আমরা তালিকা সরাতে বা লুকাতে পারি।",
      ],
    },
    {
      title: "৫. অর্ডার, বাতিল ও রিভিউ",
      paragraphs: [
        "অর্ডার করলে প্ল্যাটফর্মের মাধ্যমে সেলারের কাছে অনুরোধ যায়। অর্ডারের স্ট্যাটাস (pending, processing, shipped, completed, cancelled বা hold) সেলার এবং নিচের বাতিলের প্রক্রিয়ার মাধ্যমে প্ল্যাটফর্মে হালনাগাদ হয়।",
        "সেলার অর্ডার বাতিলের অনুরোধ করতে পারেন; ক্রেতা রাজি হলেই অর্ডার বাতিল হয়। ক্রেতা রাজি না হলে অর্ডার হোল্ডে যায়। নিরাপত্তা, জালিয়াতি বা অপব্যবহারের ক্ষেত্রে আমরা হস্তক্ষেপ করতে পারি, কিন্তু প্রতিটি বাণিজ্যিক বিরোধ মেটানো আমাদের বাধ্যবাধকতা নয়।",
        "অর্ডার সম্পন্ন হলে ক্রেতা রেটিং, মন্তব্য ও ছবিসহ একটি রিভিউ দিতে পারেন। রিভিউ সৎ ও ভদ্র হতে হবে এবং তাতে আপনার নাম ও ছবি প্রকাশ্যে দেখা যায়। শর্তাবলী ভঙ্গ করলে আমরা রিভিউ সরাতে পারি।",
      ],
    },
    {
      title: "৬. মেসেজিং, নোটিফিকেশন, ইমেইল, ব্লক ও রিপোর্ট",
      paragraphs: [
        "চ্যাট, পুশ ও ইন-অ্যাপ নোটিফিকেশন এবং ইমেইল মার্কেটপ্লেসের যোগাযোগে সহায়তার জন্য। স্প্যাম, হয়রানি, প্রতারণা বা অবৈধ কনটেন্টের জন্য এগুলো ব্যবহার করবেন না। আমরা আপনার অ্যাকাউন্ট ও অর্ডার সংক্রান্ত সার্ভিস ইমেইল পাঠাই এবং মাঝে মাঝে ঘোষণা পাঠাতে পারি, যা আপনি যেকোনো সময় আনসাবস্ক্রাইব করতে পারেন।",
        "আপনি অন্য ব্যবহারকারীকে ব্লক করতে বা ব্যবহারকারী ও তালিকা রিপোর্ট করতে পারেন। আমরা তদন্ত করে ব্যবস্থা নিতে পারি, কিন্তু নির্দিষ্ট ফলাফল বা সময়ের নিশ্চয়তা দিতে পারি না।",
      ],
    },
    {
      title: "৭. অ্যাকাউন্ট সীমিত ও ফ্রিজ",
      paragraphs: [
        "নীতি লঙ্ঘন, জালিয়াতির ঝুঁকি, আইনি ঝুঁকি, অপব্যবহার, ঐচ্ছিক প্ল্যাটফর্ম সেবার বকেয়া, অসম্পূর্ণ যাচাই বা অন্য গুরুতর উদ্বেগ আছে বলে যুক্তিসঙ্গতভাবে মনে করলে আমরা অ্যাকাউন্টকে restricted বা freeze করতে (বা অন্যভাবে প্রবেশ সীমিত করতে) পারি।",
        "Restricted অ্যাকাউন্ট সাধারণত সেলার হিসেবে তালিকা আপলোড বা ম্যানেজ করতে পারে না, কিছু ক্রেতা-সুবিধা থাকতে পারে। Frozen অ্যাকাউন্ট স্ট্যাটাস না তোলা পর্যন্ত সাধারণত অর্ডার, বিক্রি বা মেসেজ করতে পারে না। অযোগ্য সেলারের তালিকা লুকানো হতে পারে।",
        "আমরা অ্যাকাউন্ট পুনরায় চালু, আরও সীমিত বা স্থায়ীভাবে বন্ধ করতে পারি। সীমিত বা ফ্রিজ হওয়ার আগে অন্য ব্যবহারকারীদের প্রতি যে দায় তৈরি হয়েছে তা আপনার থেকেই যায়।",
      ],
    },
    {
      title: "৮. ঐচ্ছিক সেবা",
      paragraphs: [
        "পণ্যের বিজ্ঞাপন, ফিচার্ড-স্টোর এবং রেফারেল / কনটেন্ট-ক্রিয়েটর প্রোগ্রামের মতো সুবিধা আবেদনের স্ক্রিনে দেখানো অতিরিক্ত নির্দেশনার অধীনে দেওয়া হতে পারে। এসব সেবার মূল্য, মেয়াদ এবং আমাদের অনুমোদনের সিদ্ধান্ত আবেদনের সময় যেমন বলা হয় তেমনই; আমরা কোনো অনুরোধ গ্রহণ বা প্রত্যাখ্যান করতে পারি।",
        "প্রমোশন নির্দিষ্ট সংখ্যক ভিউ, অর্ডার বা বিক্রির নিশ্চয়তা দেয় না।",
      ],
    },
    {
      title: "৯. নিষিদ্ধ আচরণ",
      paragraphs: [
        "আপনি যা করতে পারবেন না: আইন ভঙ্গ করা; নিষিদ্ধ বা নকল পণ্য তালিকাভুক্ত করা; বুদ্ধিবৃত্তিক সম্পত্তি লঙ্ঘন করা; প্ল্যাটফর্ম স্ক্র্যাপ বা আক্রমণ করা; নিরাপত্তা বা অ্যাক্সেস নিয়ন্ত্রণ এড়ানো; অর্ডারে অন্যের ফোন নম্বর বা পরিচয় ব্যবহার করা; SMS ভেরিফিকেশনের অপব্যবহার করা; অসততার সাথে মূল্য, স্টক, রিভিউ বা র‍্যাঙ্কিং কারসাজি করা; অন্যকে হয়রানি করা; ভুয়া অ্যাকাউন্ট খোলা; বা জালিয়াতিতে সহায়তায় প্ল্যাটফর্ম ব্যবহার করা।",
      ],
    },
    {
      title: "১০. বুদ্ধিবৃত্তিক সম্পত্তি",
      paragraphs: [
        "প্ল্যাটফর্মের সফটওয়্যার, ব্র্যান্ডিং ও সংশ্লিষ্ট উপকরণের (ব্যবহারকারীর কনটেন্ট বাদে) মালিক JBH। আপনার আপলোড করা কনটেন্টের অধিকার আপনারই থাকে এবং মার্কেটপ্লেস চালাতে ও প্রচার করতে সেই কনটেন্ট হোস্ট, প্রদর্শন ও ব্যবহারের জন্য আপনি JBH-কে একটি অ-একচেটিয়া লাইসেন্স দেন।",
        "আপনি নিশ্চিত করেন যে আপনার আপলোড করা ছবি ও লেখার অধিকার আপনার আছে। কোনো তালিকা আপনার অধিকার লঙ্ঘন করছে মনে করলে তালিকাটি ও আপনার দাবির বিবরণ সহ নিচের ঠিকানায় ইমেইল করুন; আমরা তালিকাটি সরাতে পারি।",
      ],
    },
    {
      title: "১১. দাবিত্যাগ",
      paragraphs: [
        "প্ল্যাটফর্ম “যেমন আছে” এবং “যেমন পাওয়া যায়” ভিত্তিতে দেওয়া হয়। আইন যতদূর অনুমতি দেয়, আমরা নিরবচ্ছিন্ন সেবা, ত্রুটিমুক্ত পরিচালনা বা কোনো নির্দিষ্ট উদ্দেশ্যের উপযুক্ততার প্রতিশ্রুতি দিই না।",
        "আমরা প্রতিটি সেলার বা তালিকা সমর্থন করি না। তালিকা, চ্যাটের কথা বা প্ল্যাটফর্মের বাইরের পেমেন্ট ব্যবস্থার উপর নির্ভর করা আপনার নিজ ঝুঁকিতে।",
      ],
    },
    {
      title: "১২. দায়ের সীমাবদ্ধতা",
      paragraphs: [
        "আইন যতদূর অনুমতি দেয়, প্ল্যাটফর্ম ব্যবহার বা ব্যবহারকারীদের মধ্যকার লেনদেন থেকে উদ্ভূত পরোক্ষ, আনুষঙ্গিক, বিশেষ, ফলস্বরূপ বা শাস্তিমূলক ক্ষতি অথবা মুনাফা, তথ্য বা সুনামের ক্ষতির জন্য JBH দায়ী নয়।",
        "যেকোনো বারো মাসের সময়কালে প্ল্যাটফর্ম সম্পর্কিত দাবিতে আমাদের মোট দায় সেই সময়ে ঐচ্ছিক প্ল্যাটফর্ম সেবার জন্য আপনি JBH-কে যে ফি (যদি থাকে) দিয়েছেন তাতে সীমাবদ্ধ, অথবা কোনো ফি না দিলে BDT ৫,০০০ — যেখানে আইনে দায় সীমিত করা যায় না (যেমন আমাদের প্রমাণিত প্রতারণা বা ইচ্ছাকৃত অসদাচরণ) সেখানে ব্যতীত।",
      ],
    },
    {
      title: "১৩. ক্ষতিপূরণ",
      paragraphs: [
        "আইন যতদূর অনুমতি দেয়, আপনার তালিকা, অর্ডার, কনটেন্ট, প্ল্যাটফর্মের অপব্যবহার বা এই শর্তাবলী ভঙ্গ থেকে উদ্ভূত দাবি থেকে JBH ও এর কর্মকর্তাদের ক্ষতিপূরণ দিতে ও দায়মুক্ত রাখতে আপনি সম্মত।",
      ],
    },
    {
      title: "১৪. স্থগিত ও সমাপ্তি",
      paragraphs: [
        "আপনি যেকোনো সময় প্ল্যাটফর্ম ব্যবহার বন্ধ করতে পারেন এবং প্রাইভেসি পলিসিতে বলা পদ্ধতিতে অ্যাকাউন্ট বন্ধের অনুরোধ করতে পারেন। শর্তাবলী ভঙ্গ বা পরিচালনাগত/আইনি কারণে আমরা প্রবেশ স্থগিত বা বন্ধ করতে পারি। প্রকৃতিগতভাবে যেসব বিধান টিকে থাকার কথা (দায়ের সীমা, ক্ষতিপূরণ ও বুদ্ধিবৃত্তিক সম্পত্তিসহ) সেগুলো সমাপ্তির পরও বহাল থাকে।",
      ],
    },
    {
      title: "১৫. শর্তাবলীর পরিবর্তন",
      paragraphs: [
        "আমরা এই শর্তাবলী হালনাগাদ করতে পারি। করলে “Last updated” তারিখ বদলাবে এবং গুরুত্বপূর্ণ পরিবর্তন অ্যাপ, ওয়েবসাইট বা ইমেইলে জানানো হতে পারে। পরিবর্তন কার্যকর হওয়ার পর প্ল্যাটফর্ম ব্যবহার চালিয়ে গেলে আপনি তা মেনে নিয়েছেন ধরা হবে; আইনে অতিরিক্ত সম্মতি লাগলে তা আলাদা।",
      ],
    },
    {
      title: "১৬. প্রযোজ্য আইন",
      paragraphs: [
        "এই শর্তাবলী বাংলাদেশের আইন দ্বারা নিয়ন্ত্রিত। বাংলাদেশের আদালতের এখতিয়ার থাকবে; যে বাধ্যতামূলক ভোক্তা বা ব্যবসায়িক সুরক্ষা ছাড় দেওয়া যায় না তা এতে সীমিত হয় না।",
      ],
    },
    {
      title: "১৭. যোগাযোগ",
      paragraphs: [
        `${LEGAL_COMPANY}`,
        `ঠিকানা: ${LEGAL_ADDRESS_BN}`,
        `ইমেইল: ${LEGAL_CONTACT_EMAIL}`,
      ],
    },
  ],
};
