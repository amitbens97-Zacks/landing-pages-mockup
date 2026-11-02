// Pages, their defaults, and the message check ("בדיקת מסר").
import { BRAND, USER, PRODUCTS, businessContent, offerContent, BUSINESS_SECTIONS, OFFER_SECTIONS, RECOMMENDED_TEMPLATE, PAGE_STATS } from './data.js';
import { getPath } from './page.js';

let seq = 0;
const secs = (types) => types.map((type) => ({ id: `${type}-${++seq}`, type, hidden: false }));

export function makePage(kind, productId, template = RECOMMENDED_TEMPLATE) {
  const p = PRODUCTS.find((x) => x.id === productId);
  const business = kind === 'business';
  return {
    id: business ? 'business' : productId,
    kind,
    productId: business ? null : productId,
    name: business ? 'הדף הראשי של העסק' : `הצעה: ${p.short}`,
    slug: business ? '' : p.slug,
    template,
    theme: { primary: BRAND.primary, accent: BRAND.accent, font: 'template', btn: null },
    sections: secs(business ? BUSINESS_SECTIONS : OFFER_SECTIONS),
    content: business ? businessContent() : offerContent(productId),
    photo: USER.photo,
    status: 'draft',
    seo: business
      ? { title: `${USER.business} · ${USER.fullName}`, desc: 'ליווי שיווק אישי לעסקי שירות קטנים. אסטרטגיה, קמפיינים ובקרה, בשיטת 90 הימים.' }
      : { title: `${p.name} · ${USER.business}`, desc: offerContent(productId).hero.sub },
    notify: true,
    stats: PAGE_STATS[business ? 'business' : productId] || { views: 0, leads: 0, trend: [0, 0, 0, 0, 0, 0, 0] },
  };
}

export function initialPages() {
  const main = { ...makePage('business'), status: 'live' };
  const p1 = { ...makePage('offer', 'p1'), status: 'live' };
  const p2 = { ...makePage('offer', 'p2'), status: 'draft', stats: { views: 0, leads: 0, trend: [0, 0, 0, 0, 0, 0, 0] } };
  return [main, p1, p2];
}

const words = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;
const URGENCY = ['נשארו', 'רק היום', 'אחרונים', 'מבצע מסתיים', 'רק ל-', 'מהר'];

function allText(o) {
  if (typeof o === 'string') return [o];
  if (Array.isArray(o)) return o.flatMap(allText);
  if (o && typeof o === 'object') return Object.values(o).flatMap(allText);
  return [];
}

// Runs on every change. Each line: ok or "לתיקון", and the section to jump to.
export function checksOf(page) {
  const c = page.content;
  const sec = (type) => page.sections.find((s) => s.type === type);
  const visible = (type) => sec(type) && !sec(type).hidden;
  const titleWords = words(c.hero.title);
  const fake = allText({ ...c, offer: c.offer ? { ...c.offer, seats: null } : undefined }).some((t) => URGENCY.some((u) => t.includes(u)));
  const list = [
    { id: 'title', ok: titleWords <= 8, label: 'כותרת ראשית קצרה', hint: titleWords <= 8 ? `${titleWords} מילים` : `${titleWords} מילים. עד 8 נקרא ברגע`, sec: sec('hero')?.id },
    { id: 'cta', ok: words(c.hero.cta) <= 4, label: 'קריאה לפעולה אחת וברורה', hint: `"${c.hero.cta}"`, sec: sec('hero')?.id },
    { id: 'photo', ok: !!page.photo, label: 'התמונה שלך בדף', hint: page.photo ? 'פנים אמיתיות בונות אמון' : 'דף עם תמונה שלך מקבל יותר פניות', sec: sec('hero')?.id, photo: true },
    { id: 'about', ok: visible('about') && words(c.about?.text) >= 12, label: '"נעים להכיר" עם טקסט', hint: visible('about') ? 'מדף המסרים' : 'האזור מוסתר', sec: sec('about')?.id },
    { id: 'urgency', ok: !fake, label: 'בלי דחיפות מזויפת', hint: fake ? 'יש בדף מילים כמו "נשארו" או "רק היום"' : 'מקומות פנויים רק לפי היומן', sec: sec('offer')?.id || sec('hero')?.id },
    { id: 'proof', ok: true, info: !(c.testimonials?.items || []).length, label: 'המלצות אמיתיות בלבד', hint: (c.testimonials?.items || []).length ? `${c.testimonials.items.length} המלצות` : 'עוד אין המלצות, האזור לא יופיע בדף', sec: sec('testimonials')?.id },
    { id: 'contact', ok: !!USER.phone, label: 'טופס ווואטסאפ לפניות', hint: 'כל פנייה נכנסת ללידים', sec: sec('contact')?.id },
  ];
  if (page.kind === 'offer') list.splice(4, 0, { id: 'price', ok: visible('offer') && !!c.offer?.price, label: 'מחיר ותנאי תשלום', hint: c.offer?.terms, sec: sec('offer')?.id });
  return list;
}

export const openChecks = (page) => checksOf(page).filter((c) => !c.ok).length;
export { getPath };
