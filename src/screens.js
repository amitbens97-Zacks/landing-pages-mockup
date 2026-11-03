// The step "דף נחיתה בקליק" (step 9, chapter 3): opening, what goes into the page,
// the template, the AI wait, the editor (editor.js) and the published page.
import { html, useState, useEffect, useRef, Icon, PencilCheck, cx, confetti } from './lib.js';
import { Button, Mark, Note, SharkAvatar, StepHeading } from './components.js';
import { Sheet, Field, inputCls, DeviceSwitch, BrowserFrame, Tag } from './ui.js';
import { PageView, Thumb, LogoMark, UrlLine } from './page.js';
import { SharePreview, PhotoSheet } from './editor.js';
import { USER, BRAND, SOURCES, TEMPLATES, RECOMMENDED_TEMPLATE, PARTS, pageUrl, PARTNER, g } from './data.js';

// ---------- opening (first entry only) ----------

export function Opening({ page }) {
  return html`<div class="mx-auto grid max-w-[1180px] items-center gap-8 px-4 py-6 md:grid-cols-[0.9fr_1.1fr] md:gap-12 md:px-8 md:py-10">
    <div>
      <${StepHeading} n="9" eyebrow="שלב 9 · בניית מותג אישי" title=${['דף לעסק, ', 'מוכן לשיתוף', '']} />
      <p class="mb-6 text-[18px] text-ink">כל מה שבנית עד עכשיו הופך לדף אחד מעוצב, בצבעי הלוגו ועם התמונה שלך. בוחרים עיצוב, משנים מה שרוצים ישר על הדף, ומפרסמים.</p>
      <div class="flex flex-col gap-2 border-t border-line pt-4 text-[15px]">
        <p class="flex flex-wrap items-center gap-x-2 gap-y-1"><${Icon} name="list" size=${17} class="text-brand-600" /><b>החלקים:</b> ${PARTS.join(' · ')}</p>
        <p class="flex items-center gap-2"><${Icon} name="clock" size=${17} class="text-brand-600" /><b>זמן:</b> כ-10 דקות</p>
        <p class="flex items-center gap-2"><${Icon} name="file-check-2" size=${17} class="text-brand-600" /><b>התוצר:</b> דף העסק באוויר, עם קישור קצר</p>
      </div>
    </div>
    <div class="relative pb-10">
      <div class="rotate-[-1.2deg]">
        <${BrowserFrame} url=${pageUrl('')}><${Thumb} page=${page} width=${1180} height=${760} /><//>
      </div>
      <span class="hand absolute bottom-0 left-6 rotate-[-4deg] text-[26px]">הדף שלך, בצבעים שלך</span>
    </div>
  </div>`;
}

// ---------- part 1: what goes into the page ----------

export function DataScreen({ page, set }) {
  const [photoOpen, setPhotoOpen] = useState(false);
  return html`<div class="mx-auto max-w-[1180px] px-4 py-5 md:px-8 md:py-7">
    <${StepHeading} n="1" eyebrow="חלק 1 מתוך 4 · מה נכנס לדף" title=${['כל מה שכתבת ', 'כבר כאן', '']} sub="אספנו מהשלבים הקודמים את מה שהדף צריך. נשאר רק להוסיף תמונה שלך." />
    <div class="grid gap-5 md:grid-cols-[1.25fr_0.75fr]">
      <section class="fb-panel !p-4 md:!p-5">
        <h2 class="fb-h3 mb-3">מהשלבים הקודמים</h2>
        <ul class="flex flex-col divide-y divide-line">
          ${SOURCES.map(
            (s) => html`<li key=${s.id} class="flex items-start gap-3 py-2.5">
              <span class="mt-0.5 shrink-0"><${PencilCheck} size=${20} color="#0038b8" /></span>
              <span class="min-w-0 flex-1">
                <span class="flex flex-wrap items-center gap-2"><b class="text-[15px]">${s.label}</b><${Tag} tone="muted">משלב ${s.step} · ${s.from}<//></span>
                ${s.id === 'logo'
                  ? html`<span class="mt-1.5 flex items-center gap-2.5">
                      <${LogoMark} P=${BRAND.primary} A=${BRAND.accent} size=${30} /><b class="font-display">${USER.business}</b>
                      ${BRAND.swatches.slice(0, 2).map((c) => html`<i key=${c} class="h-5 w-5 rounded-full ring-2 ring-white" style=${{ background: c }}></i>`)}
                    </span>`
                  : html`<span class="mt-0.5 line-clamp-2 block text-[14px] text-muted">${s.value}</span>`}
              </span>
            </li>`,
          )}
        </ul>
        <p class="mt-2 text-[13px] text-muted">אפשר לשנות כל טקסט אחר כך, ישר על הדף. השינוי נשמר רק בדף.</p>
      </section>

      <div class="flex flex-col gap-5">
        <section class="fb-panel !p-4 md:!p-5">
          <div class="mb-3 flex items-center justify-between gap-2">
            <h2 class="fb-h3">התמונה שלך</h2>
            <${Tag} tone=${page.photo ? 'live' : 'blue'}>${page.photo ? 'נוספה' : 'מומלץ'}<//>
          </div>
          <button type="button" class="group flex w-full items-center gap-4 rounded-2xl border-2 border-dashed border-brand-300 bg-white p-3 text-start cursor-pointer hover:bg-brand-50" onClick=${() => setPhotoOpen(true)}>
            ${page.photo
              ? html`<img src=${page.photo} alt="" class="h-24 w-20 rounded-xl object-cover" />`
              : html`<span class="grid h-24 w-20 place-items-center rounded-xl bg-canvas text-brand-600"><${Icon} name="camera" size=${28} /></span>`}
            <span class="min-w-0">
              <b class="block text-[15px] text-brand-600">${page.photo ? 'החלפת התמונה' : 'הוספת תמונה'}</b>
              <span class="block text-[13px] text-muted">נכנסת לפתיחה ול"נעים להכיר". דף עם פנים אמיתיות מקבל יותר פניות.</span>
            </span>
          </button>
        </section>
        <section class="fb-panel !p-4 md:!p-5">
          <h2 class="fb-h3 mb-3">פרטי קשר בדף</h2>
          <${Field} label="וואטסאפ וטלפון"><input class=${inputCls} value=${USER.phone} dir="ltr" /><//>
          <${Field} label="מייל לפניות" class="!mb-1"><input class=${inputCls} value=${USER.email} dir="ltr" /><//>
          <p class="text-[12px] text-muted">מההגדרות שלך. כל פנייה מהדף נכנסת ללידים.</p>
          <p class="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-ink"><${Icon} name="user-round" size=${15} class="text-brand-600" />הדף כתוב בגוף ראשון, ${g('בלשון זכר', 'בלשון נקבה')}, לפי ההגדרות שלך</p>
        </section>
      </div>
    </div>
    ${photoOpen && html`<${PhotoSheet} page=${page} set=${set} onClose=${() => setPhotoOpen(false)} />`}
  </div>`;
}

// ---------- part 2: the template ----------

export function TemplateScreen({ page, set }) {
  const [full, setFull] = useState(null);
  return html`<div class="mx-auto max-w-[1180px] px-4 py-5 md:px-8 md:py-7">
    <${StepHeading} n="2" eyebrow="חלק 2 מתוך 4 · עיצוב" title=${['איך הדף ', 'ייראה', '?']} sub="שישה עיצובים, כולם בצבעי הלוגו שלך ועם הטקסטים שלך. אפשר להחליף גם אחר כך, בלי לאבד את התוכן." />
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="טמפלייט">
      ${TEMPLATES.map((t) => {
        const on = page.template === t.id;
        return html`<div key=${t.id} class=${cx('overflow-hidden rounded-2xl border-2 bg-white transition-shadow', on ? 'border-brand-600 shadow-[0_0_0_4px_#e9effb]' : 'border-line hover:border-brand-300')}>
          <button type="button" role="radio" aria-checked=${on} class="block w-full text-start cursor-pointer" onClick=${() => set({ template: t.id })}>
            <div class="relative">
              <${Thumb} page=${{ ...page, template: t.id }} width=${1180} height=${640} />
              ${t.id === RECOMMENDED_TEMPLATE && html`<span class="absolute right-2 top-2"><${Tag} tone="blue"><${Icon} name="sparkles" size=${12} />מומלץ ליועצים<//></span>`}
            </div>
            <div class="flex items-center gap-2.5 border-t border-line px-3.5 py-2.5">
              <span class=${cx('grid h-5 w-5 shrink-0 place-items-center rounded-full border-2', on ? 'border-brand-600 bg-brand-600 text-white' : 'border-line')}>${on && html`<${Icon} name="check" size=${12} />`}</span>
              <span class="min-w-0 flex-1"><b class="font-display text-[16px]">${t.name}</b><small class="block truncate text-[13px] text-muted">${t.desc}</small></span>
            </div>
          </button>
          <button type="button" class="flex w-full items-center justify-center gap-1.5 border-t border-line py-2 text-[13px] font-bold text-brand-600 hover:bg-brand-50 cursor-pointer" onClick=${() => setFull(t.id)}>
            <${Icon} name="maximize-2" size=${14} />תצוגה מלאה
          </button>
        </div>`;
      })}
    </div>
    ${full && html`<${FullPreview} page=${{ ...page, template: full }} name=${TEMPLATES.find((t) => t.id === full).name} onClose=${() => setFull(null)} onPick=${() => (set({ template: full }), setFull(null))} />`}
  </div>`;
}

export function FullPreview({ page, name, onClose, onPick }) {
  const [device, setDevice] = useState(window.innerWidth < 768 ? 'mobile' : 'desktop');
  return html`<${Sheet}
    title=${`טמפלייט "${name}"`}
    full
    onClose=${onClose}
    footer=${html`<${DeviceSwitch} value=${device} onChange=${setDevice} /><${Button} onClick=${onPick}>בחירה בעיצוב הזה<//>`}
  >
    <div class=${cx('mx-auto', device === 'mobile' && 'w-[390px] max-w-full')}>
      <${BrowserFrame} url=${pageUrl(page.slug)} mobile=${device === 'mobile' && window.innerWidth >= 768}>
        <${PageView} page=${page} narrow=${device === 'mobile'} sticky=${false} />
      <//>
    </div>
  <//>`;
}

// ---------- the AI wait, in stages ----------

const STAGES = [
  ['כריש המילים כותב כותרת קצרה', 'pen-line'],
  ['בונים את האזורים מהמסרים ומהסל', 'layout-list'],
  ['כריש העיצוב מתאים צבעים מהלוגו ותמונות רקע לתחום', 'palette'],
  ['מכינים את הגרסה למובייל', 'smartphone'],
  ['בודקים את המסר', 'badge-check'],
];

export function Wait({ onDone, short }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const step = short ? 650 : 1100;
    const t = setInterval(() => setI((v) => v + 1), step);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (i >= STAGES.length) {
      const t = setTimeout(onDone, 350);
      return () => clearTimeout(t);
    }
  }, [i]);
  return html`<div class="mx-auto grid max-w-[1000px] items-center gap-8 px-4 py-8 md:grid-cols-[0.9fr_1.1fr] md:py-14">
    <div>
      <div class="mb-4 flex items-center gap-3">
        <${SharkAvatar} size=${54} mood="thinking" />
        <span><b class="font-display text-[18px]">${PARTNER.name}</b><small class="block text-[14px] text-muted">בונה את הדף, עוד כמה שניות</small></span>
      </div>
      <ol class="flex flex-col gap-2.5">
        ${STAGES.map(
          ([label, icon], n) => html`<li key=${label} class=${cx('flex items-center gap-3 text-[16px] transition-opacity', n > i && 'opacity-40')}>
            <span class="grid h-7 w-7 shrink-0 place-items-center">${n < i ? html`<${PencilCheck} size=${22} color="#0038b8" />` : n === i ? html`<span class="fb-spin"></span>` : html`<${Icon} name=${icon} size=${18} class="text-muted" />`}</span>
            <span class=${cx(n === i && 'font-bold')}>${label}</span>
          </li>`,
        )}
      </ol>
    </div>
    <div class="fb-panel !p-4" aria-hidden="true">
      <div class="skeleton mb-3 h-6 w-1/3 rounded"></div>
      <div class="grid grid-cols-[1.2fr_0.8fr] gap-4">
        <div><div class="skeleton mb-2 h-9 rounded"></div><div class="skeleton mb-2 h-9 w-4/5 rounded"></div><div class="skeleton mb-4 h-4 w-3/4 rounded"></div><div class="skeleton h-11 w-40 rounded-xl"></div></div>
        <div class="skeleton aspect-[4/4.6] rounded-2xl"></div>
      </div>
      <div class="mt-5 grid grid-cols-3 gap-3">${[0, 1, 2].map((k) => html`<div key=${k} class="skeleton h-20 rounded-xl"></div>`)}</div>
    </div>
  </div>`;
}

// ---------- part 4: the page is live ----------

export function Done({ page, onPages, notify }) {
  useEffect(() => {
    const t = setTimeout(() => confetti('step'), 200);
    return () => clearTimeout(t);
  }, []);
  const url = pageUrl(page.slug);
  return html`<div class="mx-auto max-w-[1100px] px-4 py-6 md:px-8 md:py-9">
    <${StepHeading} n="4" eyebrow="חלק 4 מתוך 4 · פרסום" title=${['הדף שלך ', 'באוויר', '!']} sub="אפשר לשלוח את הקישור כבר עכשיו. כל פנייה מהדף נכנסת ללידים." />
    <div class="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
      <div class="flex flex-col gap-5">
        <section class="fb-panel !p-4 md:!p-5">
          <p class="mb-2 text-[14px] font-bold text-muted">הקישור שלך</p>
          <div class="mb-3 flex items-center gap-2 rounded-xl border-[1.5px] border-brand-300 bg-white px-3 py-3 text-[18px] font-bold md:text-[20px]">
            <${UrlLine} slug=${page.slug} class="flex-1" />
          </div>
          <div class="flex flex-wrap gap-2">
            <${Button} variant="secondary" onClick=${() => (navigator.clipboard?.writeText(`https://${url}`).catch(() => {}), notify('הקישור הועתק', 'copy'))}><${Icon} name="copy" size=${17} />העתקה<//>
            <${Button} variant="secondary" onClick=${() => notify('נפתח וואטסאפ עם הקישור (במוק-אפ: לא נפתח)', 'message-circle')}><${Icon} name="message-circle" size=${17} />שליחה בוואטסאפ<//>
            <${Button} variant="text" onClick=${() => window.open('?view=public&page=' + page.id, '_blank')}><${Icon} name="external-link" size=${16} />פתיחת הדף<//>
          </div>
          <p class="mt-3 text-[13px] text-muted">במקום הקישור הארוך של היום. הקישור הישן ממשיך לעבוד ומעביר לכאן.</p>
        </section>
        <div class="flex flex-wrap items-start gap-5">
          <${Note} tilt=${-1.5} class="max-w-[300px]">
            <span class="fb-note-kicker">חסכת</span>
            <p class="font-display text-[36px] font-black leading-none text-money">1,000 ₪</p>
            <p class="mt-1 text-[14px]">על בונה אתרים לדף נחיתה</p>
          <//>
          <${Note} tone="white" tilt=${1} class="max-w-[320px]">
            <span class="mb-1.5 flex items-center gap-2"><${SharkAvatar} size=${34} mood="happy" /><b class="font-display">${PARTNER.name}</b></span>
            <p class="text-[15px]">רוצה דף לכל הצעה בסל? ב"הדפים שלי" יוצרים דף להצעה בלחיצה, באותו עיצוב.</p>
            <button type="button" class="fb-fill-btn mt-2" onClick=${onPages}><${Icon} name="layout-grid" size=${16} />להדפים שלי</button>
          <//>
        </div>
      </div>
      <section>
        <p class="mb-2 text-[14px] font-bold">כך הקישור נראה בוואטסאפ</p>
        <${SharePreview} page=${page} />
      </section>
    </div>
  </div>`;
}
