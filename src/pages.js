// "הדפים שלי": every page of the business (the main page from the step and a page per
// offer), with its link, views and leads, and "דף חדש" for another offer from the basket.
import { html, useState, Icon, cx } from './lib.js';
import { Button, Mark, SharkAvatar } from './components.js';
import { Sheet, Tag, Chips } from './ui.js';
import { Thumb, UrlLine } from './page.js';
import { PRODUCTS, TEMPLATES, PARTNER, pageUrl, templateOf } from './data.js';

const nf = new Intl.NumberFormat('he-IL');

function Spark({ data }) {
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${28 - (v / max) * 24}`).join(' ');
  return html`<svg viewBox="0 0 100 30" preserveAspectRatio="none" class="h-7 w-20" aria-hidden="true"><polyline points=${pts} fill="none" stroke="#0038b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" /></svg>`;
}

export function PagesView({ pages, onEdit, onNew, onUpdate, onDuplicate, onDelete, notify }) {
  const [menu, setMenu] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const live = pages.filter((p) => p.status === 'live');
  const views = live.reduce((s, p) => s + p.stats.views, 0);
  const leads = live.reduce((s, p) => s + p.stats.leads, 0);
  return html`<div class="mx-auto max-w-[1180px] px-4 py-6 md:px-8 md:py-8">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div class="fb-heading !mb-0">
        <span class="fb-eyebrow">דפי נחיתה</span>
        <h1 class="fb-h1 text-[28px] md:text-[36px]">הדפים <${Mark}>שלי<//></h1>
        <p>דף ראשי לעסק, ודף לכל הצעה. כל פנייה מהדפים נכנסת ללידים.</p>
      </div>
      <div class="flex items-center gap-5 rounded-2xl border border-line bg-surface px-4 py-3">
        <span><b class="font-display text-[24px] font-extrabold tabular-nums">${nf.format(views)}</b><small class="block text-[13px] text-muted">צפיות ב-30 יום</small></span>
        <span class="h-9 w-px bg-line"></span>
        <span><b class="font-display text-[24px] font-extrabold tabular-nums">${leads}</b><small class="block text-[13px] text-muted">פניות שנכנסו ללידים</small></span>
      </div>
    </div>

    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      ${pages.map((p) => {
        const main = p.kind === 'business';
        return html`<article key=${p.id} class="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_30px_-24px_rgba(45,62,102,.5)]">
          <button type="button" class="relative block text-start cursor-pointer" onClick=${() => onEdit(p.id)} aria-label=${`עריכת ${p.name}`}>
            <${Thumb} page=${p} pages=${pages} width=${1180} height=${700} />
            <span class="absolute right-2 top-2 flex gap-1.5">
              <${Tag} tone=${p.status === 'live' ? 'live' : 'draft'}>${p.status === 'live' ? 'באוויר' : 'טיוטה'}<//>
              ${main && html`<${Tag} tone="blue"><${Icon} name="house" size=${12} />הדף הראשי<//>`}
            </span>
          </button>
          <div class="flex flex-1 flex-col gap-3 border-t border-line p-4">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <h2 class="truncate font-display text-[17px] font-bold">${p.name}</h2>
                <p class="text-[13px] text-muted">${main ? 'מי אני, השירותים ויצירת קשר' : `${nf.format(PRODUCTS.find((x) => x.id === p.productId).price)} ₪ · מהסל`} · ${templateOf(p.template).name}</p>
              </div>
              <div class="relative">
                <button type="button" class="lp-iconbtn" aria-label="עוד פעולות" onClick=${() => setMenu(menu === p.id ? null : p.id)}><${Icon} name="ellipsis" size=${18} /></button>
                ${menu === p.id &&
                html`<div class="pop-in absolute left-0 top-10 z-20 w-48 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-xl" onMouseLeave=${() => setMenu(null)}>
                  <button type="button" class="lp-menu" onClick=${() => (setMenu(null), onDuplicate(p.id))}><${Icon} name="copy-plus" size=${16} />שכפול</button>
                  ${p.status === 'live'
                    ? html`<button type="button" class="lp-menu" onClick=${() => (setMenu(null), onUpdate(p.id, { status: 'draft' }, 'הדף הוסר מהאוויר'))}><${Icon} name="pause" size=${16} />הורדה מהאוויר</button>`
                    : html`<button type="button" class="lp-menu" onClick=${() => (setMenu(null), onUpdate(p.id, { status: 'live' }, 'הדף באוויר'))}><${Icon} name="globe" size=${16} />פרסום</button>`}
                  ${!main && html`<button type="button" class="lp-menu text-error" onClick=${() => (setMenu(null), setConfirm(p))}><${Icon} name="trash-2" size=${16} />מחיקה</button>`}
                </div>`}
              </div>
            </div>
            <div class="flex items-center gap-1 rounded-xl bg-canvas py-1.5 pe-1 ps-3 text-[13px] font-semibold text-ink">
              <${UrlLine} slug=${p.slug} class="flex-1" />
              <button type="button" class="lp-iconbtn !h-8 !w-8" aria-label="העתקת הקישור" title="העתקה" onClick=${() => (navigator.clipboard?.writeText(`https://${pageUrl(p.slug)}`).catch(() => {}), notify('הקישור הועתק', 'copy'))}><${Icon} name="copy" size=${15} /></button>
              <button type="button" class="lp-iconbtn !h-8 !w-8" aria-label="שליחה בוואטסאפ" title="שליחה בוואטסאפ" onClick=${() => notify('נפתח וואטסאפ עם הקישור (במוק-אפ: לא נפתח)', 'message-circle')}><${Icon} name="message-circle" size=${15} /></button>
            </div>
            <div class="mt-auto flex items-end justify-between gap-3">
              ${p.status === 'live'
                ? html`<span class="flex items-end gap-4 text-[13px] text-muted">
                    <span><b class="block font-display text-[18px] text-ink">${nf.format(p.stats.views)}</b>צפיות</span>
                    <span><b class="block font-display text-[18px] text-ink">${p.stats.leads}</b>פניות</span>
                    <${Spark} data=${p.stats.trend} />
                  </span>`
                : html`<span class="text-[13px] text-muted">עוד לא פורסם</span>`}
              <${Button} variant="mini" onClick=${() => onEdit(p.id)}><${Icon} name="pencil" size=${15} />עריכה<//>
            </div>
          </div>
        </article>`;
      })}
      <button type="button" class="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-brand-300 bg-white/60 p-6 text-center hover:bg-brand-50 cursor-pointer" onClick=${onNew}>
        <span class="grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white"><${Icon} name="plus" size=${26} /></span>
        <b class="font-display text-[18px] text-brand-600">דף חדש להצעה</b>
        <span class="max-w-[240px] text-[14px] text-muted">בוחרים הצעה מהסל, והכריש בונה לה דף באותו עיצוב</span>
      </button>
    </div>

    ${confirm &&
    html`<${Sheet}
      title="למחוק את הדף?"
      onClose=${() => setConfirm(null)}
      footer=${html`<${Button} variant="secondary" onClick=${() => setConfirm(null)}>ביטול<//><${Button} class="!bg-error" onClick=${() => (onDelete(confirm.id), setConfirm(null))}>מחיקה<//>`}
    >
      <p class="text-[16px]">"${confirm.name}" יימחק, והקישור <span dir="ltr" class="font-bold">${pageUrl(confirm.slug)}</span> יעביר לדף הראשי. הפניות שכבר נכנסו נשארות בלידים.</p>
    <//>`}
  </div>`;
}

// ---------- a new page for an offer ----------

export function NewPage({ pages, onCreate, onCancel }) {
  const used = new Set(pages.filter((p) => p.kind === 'offer').map((p) => p.productId));
  const first = PRODUCTS.find((p) => !used.has(p.id)) || PRODUCTS[0];
  const mainTpl = pages.find((p) => p.kind === 'business')?.template || 'studio';
  const [product, setProduct] = useState(first.id);
  const [same, setSame] = useState(true);
  const [tpl, setTpl] = useState(mainTpl);
  return html`<div class="mx-auto max-w-[860px] px-4 py-6 md:px-8 md:py-8">
    <button type="button" class="mb-3 inline-flex items-center gap-1.5 text-[14px] font-bold text-brand-600 cursor-pointer" onClick=${onCancel}><${Icon} name="arrow-right" size=${16} />הדפים שלי</button>
    <div class="fb-heading">
      <span class="fb-eyebrow">דף חדש</span>
      <h1 class="fb-h1 text-[28px] md:text-[34px]">לאיזו <${Mark}>הצעה<//> הדף?</h1>
      <p>הדף נבנה מההצעה שבחרת: מה כלול, המחיר, תנאי התשלום והמסרים שלך.</p>
    </div>
    <div class="mb-7 flex flex-col gap-2.5" role="radiogroup">
      ${PRODUCTS.map((p) => {
        const on = product === p.id;
        return html`<button key=${p.id} type="button" role="radio" aria-checked=${on} onClick=${() => setProduct(p.id)} class=${cx('fb-tile flex items-center gap-3 !p-3.5 text-start cursor-pointer', on && 'is-on')}>
          <span class=${cx('grid h-5 w-5 shrink-0 place-items-center rounded-full border-2', on ? 'border-brand-600 bg-brand-600 text-white' : 'border-line')}>${on && html`<${Icon} name="check" size=${12} />`}</span>
          <span class="min-w-0 flex-1"><b class="block text-[16px]">${p.name}</b><small class="text-[13px] text-muted">${p.tier} · ${nf.format(p.price)} ₪</small></span>
          ${used.has(p.id) && html`<${Tag} tone="muted">יש כבר דף<//>`}
        </button>`;
      })}
    </div>

    <h2 class="fb-h3 mb-2">עיצוב</h2>
    <div class="mb-3 flex flex-col gap-2.5" role="radiogroup">
      <button type="button" role="radio" aria-checked=${same} onClick=${() => (setSame(true), setTpl(mainTpl))} class=${cx('fb-tile flex items-center gap-3 !p-3.5 text-start cursor-pointer', same && 'is-on')}>
        <span class=${cx('grid h-5 w-5 shrink-0 place-items-center rounded-full border-2', same ? 'border-brand-600 bg-brand-600 text-white' : 'border-line')}>${same && html`<${Icon} name="check" size=${12} />`}</span>
        <span class="flex-1"><b class="block text-[16px]">כמו הדף הראשי · ${templateOf(mainTpl).name}</b><small class="text-[13px] text-muted">כל הדפים של העסק נראים אותו דבר</small></span>
        <${Tag} tone="blue">מומלץ<//>
      </button>
      <button type="button" role="radio" aria-checked=${!same} onClick=${() => setSame(false)} class=${cx('fb-tile flex items-center gap-3 !p-3.5 text-start cursor-pointer', !same && 'is-on')}>
        <span class=${cx('grid h-5 w-5 shrink-0 place-items-center rounded-full border-2', !same ? 'border-brand-600 bg-brand-600 text-white' : 'border-line')}>${!same && html`<${Icon} name="check" size=${12} />`}</span>
        <span class="flex-1"><b class="block text-[16px]">עיצוב אחר</b><small class="text-[13px] text-muted">למשל "נועז" לסדנה או "יוקרה" ליום VIP</small></span>
      </button>
    </div>
    ${!same && html`<div class="mb-4 ps-8"><${Chips} small options=${TEMPLATES.map((t) => ({ id: t.id, label: t.name }))} value=${tpl} onChange=${setTpl} /></div>`}

    <div class="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
      <${Button} variant="secondary" onClick=${onCancel}>ביטול<//>
      <${Button} onClick=${() => onCreate(product, same ? mainTpl : tpl)}><${Icon} name="sparkles" size=${18} />יצירת הדף<//>
    </div>
  </div>`;
}
