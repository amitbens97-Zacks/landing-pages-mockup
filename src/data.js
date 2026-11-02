// Mock data for the landing pages task. In production:
//   name, slogan, logo and brand colors -> "שם ולוגו" (step 6)
//   the main message, pitch, "נעים להכיר" -> "דף המסרים" (step 7)
//   the offer, bonuses, guarantee, terms  -> "בניית הצעה מנצחת" (step 8)
//   services and prices                   -> "סל מוצרים" (step 3), the core product's steps
//   the photo                             -> uploaded in this step (new), kept on the business
//   phone / WhatsApp / email              -> the user's settings
//   page views and leads                  -> the published pages; every form lead goes to the CRM
// The mockup's "today" is fixed so every number on the page stays the same.

export const TODAY = '2026-11-02';

export const PARTNER = { name: 'הכריש', role: 'השותף העסקי' };

export const STEP = { n: 9, name: 'דף נחיתה בקליק', chapterNo: 3, chapter: 'בניית מותג אישי' };
export const PARTS = ['מה נכנס לדף', 'עיצוב', 'עריכה', 'פרסום'];

export const USER = {
  firstName: 'דניאל',
  fullName: 'דניאל כהן',
  business: 'שיווק שעובד',
  slogan: 'שיווק שמביא פניות, לא רק לייקים',
  field: 'ייעוץ וליווי שיווק דיגיטלי לעסקי שירות מקומיים',
  audience: 'בעלי עסקי שירות עם 1 עד 5 עובדים',
  phone: '052-4567890',
  email: 'daniel@example.co.il',
  photo: 'assets/user/daniel.svg',
};

// From "שם ולוגו": the logo and the colors taken from it.
export const BRAND = {
  primary: '#1e6b5c',
  accent: '#f0a23b',
  // Other colors found in the logo, offered as swatches in "עיצוב".
  swatches: ['#1e6b5c', '#f0a23b', '#14302a', '#3f8f7d'],
};

// The subdomain FlowBiz makes for the user (today: preview.flowbiz.co.il/l/<36-char id>).
export const SUBDOMAIN = 'danielcohen';
export const ROOT_DOMAIN = 'flowbiz.co.il';
export const OLD_LINK = 'preview.flowbiz.co.il/l/7c1f9e2a-4b6d-4e8f-a1c3-9d2e5b7f0a64';
export const pageUrl = (slug) => `${SUBDOMAIN}.${ROOT_DOMAIN}${slug ? `/${slug}` : ''}`;

// Paid products from the basket ("סל מוצרים"), with the terms from "הצעה מנצחת".
export const PRODUCTS = [
  { id: 'p1', name: 'תוכנית ליווי 90 יום 1:1', short: 'ליווי 90 יום', price: 7500, terms: 'אפשר ב-3 תשלומים של 2,500 ₪', tier: 'המוצר המרכזי', slug: '90-yom',
    desc: '12 מפגשים אישיים, אסטרטגיה כתובה וקמפיינים שבנינו יחד. בסוף יש לעסק מערך שמביא פניות גם בלי ליווי.',
    includes: ['12 מפגשים אישיים של שעה, בזום או פרונטלי', 'אסטרטגיה כתובה ל-90 יום', 'הקמת הקמפיינים והתוכן יחד', 'בקרה ושיפור כל שבועיים', 'מענה בוואטסאפ בימים א׳ עד ה׳ תוך 24 שעות'],
    title: '90 יום למערך שיווק שעובד', cta: 'לשיחת התאמה' },
  { id: 'p2', name: 'יום VIP אסטרטגי', short: 'יום VIP', price: 3900, terms: 'תשלום אחד', tier: 'פרימיום', slug: 'vip',
    desc: 'יום עבודה מרוכז אחד, ובסופו המערך השיווקי מוכן לעלייה.',
    includes: ['פגישת הכנה של 30 דקות', '6 שעות עבודה מרוכזת', 'תוכנית שיווק כתובה', 'שיחת המשך אחרי שבועיים'],
    title: 'יום אחד, ומערך שיווק מוכן', cta: 'לקביעת תאריך' },
  { id: 'b1', name: 'סדנת אסטרטגיה אישית (3 שעות)', short: 'סדנה אישית', price: 890, terms: 'תשלום אחד', tier: 'מוצר מעבר', slug: 'sadna',
    desc: '3 שעות אחד על אחד, ובסופן יש לעסק תוכנית שיווק כתובה ל-90 יום.',
    includes: ['מפגש של 3 שעות בזום או פרונטלי', 'מיפוי הלקוח והמסר', 'תוכנית שיווק כתובה ל-90 יום', 'סיכום כתוב אחרי המפגש'],
    title: 'תוכנית שיווק כתובה, בשלוש שעות', cta: 'לקביעת סדנה' },
  { id: 'r1', name: 'ריטיינר ליווי חודשי', short: 'ריטיינר חודשי', price: 2200, terms: 'מנוי חודשי, אפשר לעצור בכל חודש', tier: 'מתמשך', slug: 'retainer',
    desc: 'שני מפגשים בחודש, בקרה על הקמפיינים וזמינות שוטפת, למי שכבר יש לו מערך שיווק.',
    includes: ['שני מפגשים בחודש', 'בקרה על הקמפיינים', 'דוח חודשי קצר', 'מענה בוואטסאפ בימי עבודה'],
    title: 'מישהו ששומר על השיווק שלכם, כל חודש', cta: 'לשיחת היכרות' },
];

// What the step carries in, and from where (the "מה נכנס לדף" screen).
export const SOURCES = [
  { id: 'logo', label: 'לוגו וצבעי המותג', from: 'שם ולוגו', step: 6, icon: 'palette' },
  { id: 'name', label: 'שם העסק והסלוגן', from: 'שם ולוגו', step: 6, icon: 'type', value: `${USER.business} · ${USER.slogan}` },
  { id: 'message', label: 'המסר המרכזי', from: 'דף המסרים', step: 7, icon: 'message-square-quote', value: 'בעלי עסקים קטנים שורפים תקציב על פרסום בלי אסטרטגיה. אנחנו בונים מערך שיווק שמביא פניות, בתוך 90 יום.' },
  { id: 'about', label: '"נעים להכיר"', from: 'דף המסרים', step: 7, icon: 'user-round', value: '12 שנים ניהלתי שיווק בחברת צריכה גדולה. היום אני מביא את אותה שיטה לעסקים קטנים.' },
  { id: 'services', label: 'השירותים והמחירים', from: 'סל מוצרים', step: 3, icon: 'package', value: '4 מוצרים, מ-890 ₪ עד 7,500 ₪' },
  { id: 'offer', label: 'ההצעה, הבונוס והאחריות', from: 'בניית הצעה מנצחת', step: 8, icon: 'gift', value: 'ליווי 90 יום · בונוס סדנה אישית · החזר מלא אחרי המפגש הראשון' },
];

// ---------- Templates ----------
// Six designed templates. Each one is a full design (fonts, hero, section styles,
// corners, buttons). The colors always come from the user's logo.
export const TEMPLATES = [
  { id: 'studio', name: 'סטודיו', desc: 'נקי ומקצועי, התמונה לצד הכותרת', fit: 'יועצים ונותני שירות', head: 'Rubik', body: 'Assistant', hero: 'split', radius: 18, btn: 'round', bg: 'white' },
  { id: 'personal', name: 'אישי', desc: 'חם ואישי, התמונה שלך במרכז', fit: 'מטפלים, מאמנים ומלווים', head: 'Frank Ruhl Libre', body: 'Assistant', hero: 'portrait', radius: 26, btn: 'pill', bg: 'cream' },
  { id: 'luxe', name: 'יוקרה', desc: 'רקע כהה ואותיות עם סריף', fit: 'שירותי פרימיום', head: 'Frank Ruhl Libre', body: 'Assistant', hero: 'dark', radius: 4, btn: 'square', bg: 'dark' },
  { id: 'bold', name: 'נועז', desc: 'צבע מלא ואותיות גדולות', fit: 'סדנאות, אירועים והשקות', head: 'Heebo', body: 'Heebo', hero: 'block', radius: 0, btn: 'square', bg: 'white' },
  { id: 'minimal', name: 'מינימלי', desc: 'הרבה אוויר וקווים דקים', fit: 'אנשי מקצוע ומשרדים', head: 'Assistant', body: 'Assistant', hero: 'center', radius: 8, btn: 'round', bg: 'white' },
  { id: 'soft', name: 'רך', desc: 'גוונים בהירים ופינות עגולות', fit: 'עסקים לקהל פרטי', head: 'Rubik', body: 'Assistant', hero: 'cards', radius: 28, btn: 'pill', bg: 'tint' },
];
export const RECOMMENDED_TEMPLATE = 'studio';
export const templateOf = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];

export const FONT_PAIRS = [
  { id: 'template', label: 'לפי הטמפלייט' },
  { id: 'modern', label: 'מודרני', head: 'Rubik', body: 'Assistant' },
  { id: 'classic', label: 'קלאסי', head: 'Frank Ruhl Libre', body: 'Assistant' },
  { id: 'strong', label: 'חזק', head: 'Heebo', body: 'Heebo' },
];

// ---------- Sections ----------
export const SECTION_TYPES = {
  hero: { label: 'פתיחה', icon: 'panel-top', fixed: true },
  pain: { label: 'מכירים את זה?', icon: 'circle-help' },
  method: { label: 'השיטה', icon: 'route' },
  services: { label: 'השירותים', icon: 'package' },
  offer: { label: 'ההצעה', icon: 'gift' },
  process: { label: 'איך זה עובד', icon: 'list-ordered' },
  about: { label: 'נעים להכיר', icon: 'user-round' },
  testimonials: { label: 'המלצות', icon: 'quote' },
  faq: { label: 'שאלות נפוצות', icon: 'messages-square' },
  contact: { label: 'יצירת קשר', icon: 'send', fixed: true },
};

// ---------- Page content ----------
// Written by the model from the data above (short headline, one call to action,
// no invented numbers or urgency). Every text is editable on the page.
const SERVICES = [
  { id: 'p1', name: 'תוכנית ליווי 90 יום 1:1', desc: '12 מפגשים אישיים ובניית מערך שיווק מלא, עם זמינות בוואטסאפ.', price: 'החל מ-2,500 ₪ לחודש' },
  { id: 'p2', name: 'יום VIP אסטרטגי', desc: 'יום עבודה מרוכז שבסופו המערך השיווקי מוכן לעלייה.', price: '3,900 ₪' },
  { id: 'b1', name: 'סדנת אסטרטגיה אישית', desc: '3 שעות אחד על אחד, ובסופן תוכנית שיווק כתובה ל-90 יום.', price: '890 ₪' },
  { id: 'r1', name: 'ריטיינר ליווי חודשי', desc: 'שני מפגשים בחודש, בקרה על הקמפיינים וזמינות שוטפת.', price: '2,200 ₪ לחודש' },
];

const COMMON = {
  pain: {
    title: 'מכירים את זה?',
    items: [
      'משלמים על פרסום כל חודש, ואין מושג מה זה מביא.',
      'מעלים פוסטים כשיש זמן, והטלפון לא מצלצל.',
      'כל יועץ אומר משהו אחר, ואין תוכנית אחת ברורה.',
    ],
  },
  about: {
    title: 'נעים להכיר, דניאל',
    text: '12 שנים ניהלתי שיווק בחברת צריכה גדולה. ראיתי מקרוב מה עובד כשיש תקציב גדול, והבנתי שאותם עקרונות עובדים גם לעסק של אדם אחד. היום אני מלווה עסקי שירות קטנים, ובונה איתם שיווק שמביא פניות.',
    creds: ['12 שנות ניהול שיווק', 'יותר מ-40 עסקים בשיטה', 'ליווי בזום ופרונטלי'],
  },
  testimonials: { title: 'מה אומרים הלקוחות', items: [] },
  faq: {
    title: 'שאלות נפוצות',
    items: [
      { q: 'למי זה מתאים?', a: 'לעסקי שירות מקומיים עם 1 עד 5 עובדים, שכבר יש להם לקוחות ורוצים פניות באופן קבוע.' },
      { q: 'כמה זמן אצטרך להשקיע?', a: 'מפגש של שעה בשבוע, ועוד כשעתיים של עבודה בין המפגשים.' },
      { q: 'צריך תקציב פרסום?', a: 'לא בהתחלה. בונים קודם את הבסיס, ורק אחר כך מחליטים יחד אם ובכמה לפרסם.' },
    ],
  },
  contact: { title: 'בואו נדבר', sub: 'משאירים פרטים, ואני חוזר אליכם תוך יום עבודה.', cta: 'שליחה', wa: 'או בוואטסאפ' },
};

export function businessContent() {
  return {
    hero: {
      eyebrow: 'שיווק שעובד · דניאל כהן',
      title: 'שיווק שמביא פניות, לא רק לייקים',
      sub: 'ליווי אישי לעסקי שירות קטנים: אסטרטגיה כתובה, קמפיינים שעובדים ובקרה כל שבועיים.',
      cta: 'לשיחת היכרות',
    },
    pain: { ...COMMON.pain },
    method: {
      title: 'שיטת 90 הימים',
      sub: 'תהליך אחד ברור, שנבדק על יותר מ-40 עסקים.',
      steps: [
        { t: 'מיפוי', d: 'מוצאים איפה הכסף בורח ומי הלקוח שבאמת משלם.' },
        { t: 'בנייה', d: 'כותבים אסטרטגיה, מקימים קמפיינים ותוכן.' },
        { t: 'שיפור', d: 'בודקים כל שבועיים מה עובד, ומחזקים אותו.' },
      ],
    },
    services: { title: 'איך אפשר לעבוד יחד', sub: 'מסדנה אחת ועד ליווי מלא.', items: SERVICES.map((s) => ({ ...s })) },
    about: { ...COMMON.about, creds: [...COMMON.about.creds] },
    testimonials: { title: COMMON.testimonials.title, items: [] },
    faq: { ...COMMON.faq, items: COMMON.faq.items.map((i) => ({ ...i })) },
    contact: { ...COMMON.contact },
  };
}

export function offerContent(productId) {
  const p = PRODUCTS.find((x) => x.id === productId) || PRODUCTS[0];
  const core = p.id === 'p1';
  return {
    hero: { eyebrow: core ? 'התוכנית המרכזית' : p.name, title: p.title, sub: p.desc, cta: p.cta },
    pain: { ...COMMON.pain, items: [...COMMON.pain.items] },
    offer: {
      title: core ? 'מה כלול בתוכנית' : 'מה מקבלים',
      includes: [...p.includes],
      bonus: core ? 'בונוס: סדנת אסטרטגיה אישית של 3 שעות, בשווי 890 ₪' : '',
      price: p.price,
      terms: p.terms,
      guarantee: core ? 'אחרי המפגש הראשון אפשר לעצור ולקבל את כל הכסף בחזרה.' : '',
      seats: { on: false, n: 3, month: 'דצמבר' },
    },
    process: {
      title: 'איך זה עובד',
      steps: core ? ['פגישת אבחון ומיפוי', 'אסטרטגיה כתובה ל-90 יום', 'הקמת הקמפיינים והתוכן', 'בקרה ושיפור כל שבועיים', 'סיכום ותוכנית להמשך'] : ['שיחת התאמה קצרה', 'קובעים מועד', 'מתכוננים יחד', 'המפגש עצמו', 'שיחת המשך'],
    },
    about: { ...COMMON.about, creds: [...COMMON.about.creds] },
    testimonials: { title: COMMON.testimonials.title, items: [] },
    faq: { ...COMMON.faq, items: COMMON.faq.items.map((i) => ({ ...i })) },
    contact: { ...COMMON.contact, title: 'רוצים לבדוק התאמה?', sub: 'שיחה של 20 דקות, בלי התחייבות.' },
  };
}

export const BUSINESS_SECTIONS = ['hero', 'pain', 'method', 'services', 'about', 'testimonials', 'faq', 'contact'];
export const OFFER_SECTIONS = ['hero', 'pain', 'offer', 'process', 'about', 'testimonials', 'faq', 'contact'];

// Other wordings the shark offers for a section ("נוסח אחר"). In production: one model
// call per request, with the same data and rules.
export const ALTERNATIVES = {
  hero: [
    { title: 'פחות ניחושים, יותר פניות', sub: 'מלווה עסקי שירות קטנים לבנות שיווק שעובד, בתהליך של 90 יום.' },
    { title: 'השיווק של העסק, סוף סוף מסודר', sub: 'אסטרטגיה אחת ברורה, קמפיינים שעובדים, ובקרה קבועה. בלי לשרוף תקציב.' },
  ],
  pain: [
    { title: 'נשמע מוכר?', items: ['הפרסום עולה כסף, והפניות לא מגיעות.', 'אין זמן לתוכן, אז הוא עולה רק לפעמים.', 'יש הרבה עצות, ואין תוכנית אחת.'] },
  ],
  about: [
    { title: 'מי אני', text: 'אני דניאל. אחרי 12 שנים כמנהל שיווק בחברה גדולה, בניתי שיטה פשוטה לעסקים קטנים: מבינים מי הלקוח, בונים מסר אחד חד, ובודקים כל שבועיים מה עובד.' },
  ],
};

// The pages for "הדפים שלי" (the business page from the step + offer pages).
export const PAGE_STATS = {
  business: { views: 312, leads: 9, trend: [12, 18, 9, 22, 30, 26, 41] },
  p1: { views: 128, leads: 4, trend: [4, 9, 6, 12, 15, 19, 21] },
};
