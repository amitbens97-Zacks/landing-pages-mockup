// The editor: the page itself in the middle (click a text to change it, click a photo
// to replace it, click a section for its tools) and one side panel with four tabs:
// sections, design, settings and the message check. On a phone the panel opens as a sheet.
import { html, useState, useEffect, useRef, Icon, cx } from './lib.js';
import { Button } from './components.js';
import { Sheet, Field, inputCls, Chips, Tag, DeviceSwitch, BrowserFrame } from './ui.js';
import { PageView, Thumb, setPath, getPath, mix } from './page.js';
import { TEMPLATES, FONT_PAIRS, SECTION_TYPES, ALTERNATIVES, BRAND, USER, OLD_LINK, SUBDOMAIN, ROOT_DOMAIN, pageUrl, templateOf } from './data.js';
import { checksOf } from './state.js';

const TABS = [
  ['sections', 'אזורים', 'layout-list'],
  ['design', 'עיצוב', 'palette'],
  ['settings', 'הגדרות', 'settings-2'],
  ['check', 'בדיקת מסר', 'badge-check'],
];

const isPhone = () => window.innerWidth < 768;

export function Editor({ page, onChange, onUndo, onRedo, canUndo, canRedo, pages, onPreview, notify }) {
  const [selected, setSelected] = useState(null);
  const [device, setDevice] = useState(() => (isPhone() ? 'mobile' : 'desktop'));
  const [tab, setTab] = useState('sections');
  const [photoOpen, setPhotoOpen] = useState(false);
  const [sheet, setSheet] = useState(null);
  const [phone, setPhone] = useState(isPhone());
  const [width, setWidth] = useState(1000);
  const canvas = useRef();
  const alts = useRef({});

  useEffect(() => {
    const r = () => setPhone(isPhone());
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  useEffect(() => {
    if (!canvas.current) return;
    const ro = new ResizeObserver(() => setWidth(canvas.current.clientWidth));
    ro.observe(canvas.current);
    return () => ro.disconnect();
  }, []);

  const narrow = device === 'mobile' || width < 700;
  const set = (patch, undo) => onChange({ ...page, ...patch }, undo);
  const scrollTo = (id) => {
    setSelected(id);
    setTimeout(() => canvas.current?.querySelector(`[data-sec="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  };

  const actions = {
    onSelect: setSelected,
    onEdit: (path, v) => set({ content: setPath(page.content, path, v) }, 'הטקסט עודכן'),
    onMove: (id, dir) => {
      const list = [...page.sections];
      const i = list.findIndex((s) => s.id === id);
      const j = i + dir;
      if (j < 1 || j > list.length - 2) return;
      [list[i], list[j]] = [list[j], list[i]];
      set({ sections: list }, dir < 0 ? 'האזור עלה' : 'האזור ירד');
      setTimeout(() => scrollTo(id), 60);
    },
    onHide: (id) => {
      const s = page.sections.find((x) => x.id === id);
      set({ sections: page.sections.map((x) => (x.id === id ? { ...x, hidden: !x.hidden } : x)) }, s.hidden ? 'האזור חזר לדף' : 'האזור הוסתר');
    },
    onRewrite: (id, type) => {
      const list = ALTERNATIVES[type];
      const st = alts.current[`${page.id}:${type}`] || { i: 0, original: page.content[type] };
      const next = (st.i + 1) % (list.length + 1);
      alts.current[`${page.id}:${type}`] = { ...st, i: next };
      const value = next === 0 ? st.original : { ...page.content[type], ...list[next - 1] };
      set({ content: { ...page.content, [type]: value } }, next === 0 ? 'חזרה לנוסח המקורי' : 'הכריש כתב נוסח אחר');
    },
    onPhoto: () => setPhotoOpen(true),
    onAddTestimonial: () => {
      const items = [...(page.content.testimonials.items || []), { text: 'כתבו כאן את מה שהלקוח אמר, במילים שלו.', who: 'שם הלקוח, שם העסק' }];
      set({ content: setPath(page.content, 'testimonials.items', items) }, 'נוספה המלצה');
    },
  };

  const panelProps = { page, set, selected, scrollTo, onPhoto: () => setPhotoOpen(true), notify };
  const panel = (id) =>
    ({
      sections: html`<${SectionsPanel} ...${panelProps} actions=${actions} />`,
      design: html`<${DesignPanel} ...${panelProps} />`,
      settings: html`<${SettingsPanel} ...${panelProps} />`,
      check: html`<${CheckPanel} ...${panelProps} />`,
    })[id];
  const open = checksOf(page).filter((c) => !c.ok).length;

  return html`<div class="flex min-h-0 flex-1">
    ${!phone &&
    html`<aside class="flex w-[340px] shrink-0 flex-col border-e border-line bg-surface">
      <div class="grid grid-cols-4 gap-1 border-b border-line p-2" role="tablist">
        ${TABS.map(
          ([id, label, icon]) => html`<button
            key=${id}
            type="button"
            role="tab"
            aria-selected=${tab === id}
            onClick=${() => setTab(id)}
            class=${cx('relative flex flex-col items-center gap-1 rounded-xl py-2 text-[12px] font-bold cursor-pointer', tab === id ? 'bg-brand-100 text-brand-600' : 'text-muted hover:bg-canvas')}
          >
            <${Icon} name=${icon} size=${18} />${label}
            ${id === 'check' && open > 0 && html`<span class="absolute left-2 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-error px-1 text-[11px] text-white">${open}</span>`}
          </button>`,
        )}
      </div>
      <div class="thin-scroll min-h-0 flex-1 overflow-y-auto p-4">${panel(tab)}</div>
    </aside>`}

    <div class="flex min-w-0 flex-1 flex-col bg-[#ebe7dd]">
      <div class="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-canvas px-3 md:px-5">
        ${!phone && html`<${DeviceSwitch} value=${device} onChange=${setDevice} />`}
        <span class="mx-1 h-6 w-px bg-line max-md:hidden"></span>
        <button type="button" class="lp-iconbtn" title="ביטול פעולה (Ctrl+Z)" aria-label="ביטול פעולה" disabled=${!canUndo} onClick=${onUndo}><${Icon} name="undo-2" size=${18} /></button>
        <button type="button" class="lp-iconbtn" title="חזרה על פעולה" aria-label="חזרה על פעולה" disabled=${!canRedo} onClick=${onRedo}><${Icon} name="redo-2" size=${18} /></button>
        <p class="ms-2 hidden text-[13px] font-semibold text-muted lg:block">לחיצה על טקסט משנה אותו. לחיצה על אזור פותחת את הכלים שלו.</p>
        <button type="button" class="ms-auto inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[14px] font-bold text-brand-600 hover:bg-brand-50 cursor-pointer" onClick=${onPreview}>
          <${Icon} name="external-link" size=${16} />תצוגה מקדימה
        </button>
      </div>
      <div ref=${canvas} class="thin-scroll min-h-0 flex-1 overflow-y-auto" onClick=${(e) => e.target === e.currentTarget && setSelected(null)}>
        <div class=${cx('mx-auto', device === 'mobile' && !phone ? 'my-6 w-[390px]' : phone ? '' : 'my-5 max-w-[1180px] px-5')}>
          ${phone
            ? html`<${PageView} page=${page} editable narrow selected=${selected} pages=${pages} ...${actions} />`
            : html`<${BrowserFrame} url=${pageUrl(page.slug)} mobile=${device === 'mobile'}>
                <${PageView} page=${page} editable narrow=${narrow} mid=${width < 1040} selected=${selected} pages=${pages} ...${actions} />
              <//>`}
        </div>
      </div>
      ${phone &&
      html`<div class="grid shrink-0 grid-cols-4 gap-1 border-t border-line bg-surface p-1.5">
        ${TABS.map(
          ([id, label, icon]) => html`<button key=${id} type="button" onClick=${() => setSheet(id)} class="relative flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[12px] font-bold text-muted cursor-pointer">
            <${Icon} name=${icon} size=${18} />${label}
            ${id === 'check' && open > 0 && html`<span class="absolute left-3 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-error px-1 text-[11px] text-white">${open}</span>`}
          </button>`,
        )}
      </div>`}
    </div>

    ${sheet && html`<${Sheet} title=${TABS.find((t) => t[0] === sheet)[1]} onClose=${() => setSheet(null)}>${panel(sheet)}<//>`}
    ${photoOpen && html`<${PhotoSheet} page=${page} set=${set} onClose=${() => setPhotoOpen(false)} />`}
  </div>`;
}

// ---------- tab 1: sections ----------

function SectionsPanel({ page, set, selected, scrollTo, actions }) {
  const present = new Set(page.sections.map((s) => s.type));
  const addable = Object.keys(SECTION_TYPES).filter((t) => !present.has(t) && (page.kind === 'offer' ? t !== 'services' : t !== 'offer'));
  const add = (type) => {
    const id = `${type}-${Date.now()}`;
    const list = [...page.sections];
    list.splice(list.length - 1, 0, { id, type, hidden: false });
    let content = page.content;
    if (!content[type]) content = { ...content, [type]: defaultsFor(type) };
    set({ sections: list, content }, 'האזור נוסף');
    scrollTo(id);
  };
  return html`<div>
    <p class="mb-3 text-[14px] text-muted">הסדר כאן הוא הסדר בדף. "פתיחה" ו"יצירת קשר" תמיד ראשון ואחרון.</p>
    <ol class="flex flex-col gap-1.5">
      ${page.sections.map((s, i) => {
        const meta = SECTION_TYPES[s.type];
        const empty = s.type === 'testimonials' && !(page.content.testimonials?.items || []).length;
        return html`<li
          key=${s.id}
          class=${cx('group flex items-center gap-2 rounded-xl border-[1.5px] bg-white px-2.5 py-2', selected === s.id ? 'border-brand-600' : 'border-line', s.hidden && 'opacity-55')}
        >
          <button type="button" class="flex min-w-0 flex-1 items-center gap-2 text-start cursor-pointer" onClick=${() => scrollTo(s.id)}>
            <span class="fb-chip-ic sketch-chip h-8 w-8 shrink-0"><${Icon} name=${meta.icon} size=${16} /></span>
            <span class="min-w-0">
              <b class="block truncate text-[15px]">${meta.label}</b>
              ${(s.hidden || empty) && html`<small class="block text-[12px] font-semibold text-muted">${s.hidden ? 'מוסתר' : 'לא יופיע עד שתהיה המלצה'}</small>`}
            </span>
          </button>
          ${!meta.fixed &&
          html`<span class="flex items-center">
            <button type="button" class="lp-iconbtn !h-8 !w-8" aria-label="למעלה" disabled=${i <= 1} onClick=${() => actions.onMove(s.id, -1)}><${Icon} name="chevron-up" size=${16} /></button>
            <button type="button" class="lp-iconbtn !h-8 !w-8" aria-label="למטה" disabled=${i >= page.sections.length - 2} onClick=${() => actions.onMove(s.id, 1)}><${Icon} name="chevron-down" size=${16} /></button>
            <button type="button" class="lp-iconbtn !h-8 !w-8" aria-label=${s.hidden ? 'הצגה' : 'הסתרה'} title=${s.hidden ? 'הצגה' : 'הסתרה'} onClick=${() => actions.onHide(s.id)}><${Icon} name=${s.hidden ? 'eye-off' : 'eye'} size=${16} /></button>
          </span>`}
        </li>`;
      })}
    </ol>
    ${addable.length > 0 &&
    html`<div class="mt-5">
      <p class="mb-2 text-[14px] font-bold">הוספת אזור</p>
      <div class="flex flex-wrap gap-2">
        ${addable.map(
          (t) => html`<button key=${t} type="button" class="inline-flex h-9 items-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-brand-300 bg-white px-3 text-[14px] font-bold text-brand-600 hover:bg-brand-50 cursor-pointer" onClick=${() => add(t)}>
            <${Icon} name="plus" size=${15} />${SECTION_TYPES[t].label}
          </button>`,
        )}
      </div>
    </div>`}
  </div>`;
}

function defaultsFor(type) {
  if (type === 'process') return { title: 'איך זה עובד', steps: ['פגישת היכרות', 'תוכנית עבודה', 'ביצוע', 'בקרה', 'סיכום'] };
  if (type === 'method') return { title: 'שיטת 90 הימים', sub: 'תהליך אחד ברור.', steps: [{ t: 'מיפוי', d: '' }, { t: 'בנייה', d: '' }, { t: 'שיפור', d: '' }] };
  return {};
}

// ---------- tab 2: design ----------

function DesignPanel({ page, set, onPhoto }) {
  const t = templateOf(page.template);
  const brandColors = page.theme.primary === BRAND.primary && page.theme.accent === BRAND.accent;
  const color = (key, label) => html`<div class="mb-3">
    <p class="mb-1.5 text-[14px] font-bold">${label}</p>
    <div class="flex flex-wrap items-center gap-2">
      ${BRAND.swatches.map(
        (c) => html`<button
          key=${c}
          type="button"
          aria-label=${c}
          aria-pressed=${page.theme[key] === c}
          onClick=${() => set({ theme: { ...page.theme, [key]: c } }, 'הצבע עודכן')}
          class=${cx('h-9 w-9 rounded-full border-2 cursor-pointer', page.theme[key] === c ? 'border-ink ring-2 ring-brand-300 ring-offset-2' : 'border-white shadow')}
          style=${{ background: c }}
        ></button>`,
      )}
      <label class="relative inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-line bg-white px-3 text-[13px] font-bold text-muted hover:border-brand-300">
        <${Icon} name="pipette" size=${15} />אחר
        <input type="color" class="absolute inset-0 cursor-pointer opacity-0" value=${page.theme[key]} onChange=${(e) => set({ theme: { ...page.theme, [key]: e.target.value } }, 'הצבע עודכן')} />
      </label>
    </div>
  </div>`;
  return html`<div>
    <p class="mb-2 text-[14px] font-bold">טמפלייט</p>
    <div class="mb-1 grid grid-cols-3 gap-2">
      ${TEMPLATES.map(
        (tp) => html`<button
          key=${tp.id}
          type="button"
          aria-pressed=${page.template === tp.id}
          onClick=${() => tp.id !== page.template && set({ template: tp.id }, `הטמפלייט "${tp.name}"`)}
          class=${cx('overflow-hidden rounded-xl border-[1.5px] bg-white text-[13px] font-bold cursor-pointer', page.template === tp.id ? 'border-brand-600 ring-2 ring-brand-100' : 'border-line hover:border-brand-300')}
        >
          <${Thumb} page=${{ ...page, template: tp.id }} width=${1180} height=${700} />
          <span class="block py-1">${tp.name}</span>
        </button>`,
      )}
    </div>
    <p class="mb-5 text-[12px] text-muted">התוכן נשאר כמו שהוא. רק העיצוב מתחלף.</p>

    ${color('primary', 'צבע ראשי')}
    ${color('accent', 'צבע משני')}
    <p class="mb-5 text-[12px] text-muted">
      ${brandColors
        ? html`<span class="inline-flex items-center gap-1"><${Icon} name="check" size=${13} />הצבעים מהלוגו שלך</span>`
        : html`<button type="button" class="font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${() => set({ theme: { ...page.theme, primary: BRAND.primary, accent: BRAND.accent } }, 'חזרה לצבעי הלוגו')}>חזרה לצבעי הלוגו</button>`}
    </p>

    <p class="mb-1.5 text-[14px] font-bold">גופן</p>
    <div class="mb-5"><${Chips} small options=${FONT_PAIRS.map((f) => ({ id: f.id, label: f.id === 'template' ? `לפי הטמפלייט (${t.head === 'Frank Ruhl Libre' ? 'קלאסי' : t.head === 'Heebo' ? 'חזק' : 'מודרני'})` : f.label }))} value=${page.theme.font} onChange=${(v) => set({ theme: { ...page.theme, font: v } }, 'הגופן עודכן')} /></div>

    <p class="mb-1.5 text-[14px] font-bold">כפתורים</p>
    <div class="mb-5"><${Chips} small options=${[{ id: 'round', label: 'פינות עגולות' }, { id: 'pill', label: 'עגול מלא' }, { id: 'square', label: 'מרובע' }]} value=${page.theme.btn || t.btn} onChange=${(v) => set({ theme: { ...page.theme, btn: v } }, 'הכפתורים עודכנו')} /></div>

    <p class="mb-1.5 text-[14px] font-bold">התמונה שלך</p>
    <div class="flex items-center gap-3 rounded-xl border-[1.5px] border-line bg-white p-2.5">
      ${page.photo
        ? html`<img src=${page.photo} alt="" class="h-14 w-14 rounded-lg object-cover" />`
        : html`<span class="grid h-14 w-14 place-items-center rounded-lg bg-canvas text-muted"><${Icon} name="camera" size=${22} /></span>`}
      <span class="flex-1 text-[13px] text-muted">${page.photo ? 'מופיעה בפתיחה וב"נעים להכיר"' : 'עוד אין תמונה'}</span>
      <${Button} variant="mini" onClick=${onPhoto}>${page.photo ? 'החלפה' : 'הוספה'}<//>
    </div>
  </div>`;
}

// ---------- tab 3: settings ----------

function SettingsPanel({ page, set }) {
  const [slug, setSlug] = useState(page.slug);
  const taken = ['vip-day', 'blog', 'admin'].includes(slug);
  const valid = /^[a-z0-9-]*$/.test(slug);
  return html`<div>
    <${Field} label="שם הדף" hint="רק בשבילך, ב'הדפים שלי'. הלקוחות לא רואים אותו.">
      <input class=${inputCls} value=${page.name} onChange=${(e) => set({ name: e.target.value }, 'השם עודכן')} />
    <//>
    <div class="mb-4">
      <p class="mb-1 text-[14px] font-bold">הקישור</p>
      ${page.kind === 'business'
        ? html`<div class="flex h-11 items-center rounded-xl border-[1.5px] border-line bg-canvas px-3 text-[15px] font-semibold" dir="ltr">${SUBDOMAIN}.${ROOT_DOMAIN}</div>
            <p class="mt-1 text-[12px] text-muted">הדף הראשי יושב על הכתובת של העסק. דפי ההצעות יושבים תחתיה.</p>`
        : html`<div class="flex h-11 items-center overflow-hidden rounded-xl border-[1.5px] border-line bg-white focus-within:border-brand-600" dir="ltr">
              <span class="flex h-full items-center bg-canvas px-2.5 text-[14px] text-muted">${SUBDOMAIN}.${ROOT_DOMAIN}/</span>
              <input class="h-full min-w-0 flex-1 px-2 text-[15px] font-semibold outline-none" value=${slug} onInput=${(e) => setSlug(e.target.value.toLowerCase())} onBlur=${() => valid && !taken && slug && set({ slug }, 'הקישור עודכן')} />
            </div>
            <p class=${cx('mt-1 text-[12px] font-bold', taken || !valid ? 'text-error' : 'text-money')}>${!valid ? 'רק אותיות באנגלית, מספרים ומקף' : taken ? 'הקישור תפוס, אפשר לנסות אחר' : 'הקישור פנוי'}</p>`}
      <p class="mt-2 rounded-lg bg-canvas px-2.5 py-2 text-[12px] text-muted">הקישור הישן ממשיך לעבוד ומעביר לכאן:<br /><span dir="ltr" class="break-all">${OLD_LINK}</span></p>
    </div>

    <${Field} label="וואטסאפ לפניות" hint="מההגדרות שלך. הכפתור הירוק בדף פותח שיחה למספר הזה.">
      <input class=${inputCls} value=${USER.phone} dir="ltr" />
    <//>

    <div class="mb-4 rounded-xl border-[1.5px] border-line bg-white p-3">
      <p class="flex items-center gap-2 text-[14px] font-bold"><${Icon} name="users" size=${16} />לאן מגיעות הפניות</p>
      <p class="mt-1 text-[13px] text-muted">כל פנייה מהטופס נכנסת ללידים, עם שם הדף כמקור ("${page.name}").</p>
      <label class="mt-2 flex items-center gap-2 text-[14px] font-semibold">
        <input type="checkbox" checked=${page.notify} onChange=${(e) => set({ notify: e.target.checked }, 'ההגדרה עודכנה')} class="h-4 w-4 accent-[#0038b8]" />
        הודעה במייל על כל פנייה חדשה
      </label>
    </div>

    <${Collapse} title="דומיין משלך" icon="globe" sub="קיים היום. למי שכבר קנה דומיין">
      <p class="mb-2 text-[13px] text-muted">במקום הקישור של FlowBiz, למשל www.shivuk-sheoved.co.il. מוסיפים אצל ספק הדומיין את הרשומות שמופיעות כאן, ובודקים חיבור (עד 48 שעות).</p>
      <div class="flex gap-2"><input class=${inputCls} placeholder="www.example.co.il" dir="ltr" /><${Button} variant="mini">חיבור<//></div>
    <//>
    <${Collapse} title="מדידה ופרסום" icon="chart-line" sub="קיים היום. פיקסל של Meta ו-Google">
      <${Field} label="Meta Pixel ID"><input class=${inputCls} dir="ltr" placeholder="123456789012345" /><//>
      <${Field} label="Google Analytics ID" class="!mb-0"><input class=${inputCls} dir="ltr" placeholder="G-XXXXXXX" /><//>
    <//>

    <p class="mb-1 mt-4 text-[14px] font-bold">כך הקישור ייראה בשיתוף</p>
    <p class="mb-2 text-[12px] text-muted">בוואטסאפ, בפייסבוק ובגוגל.</p>
    <${SharePreview} page=${page} />
    <${Field} label="כותרת לשיתוף" class="mt-3"><input class=${inputCls} value=${page.seo.title} onChange=${(e) => set({ seo: { ...page.seo, title: e.target.value } }, 'עודכן')} /><//>
    <${Field} label="תיאור קצר"><textarea class=${cx(inputCls, '!h-20 py-2')} onChange=${(e) => set({ seo: { ...page.seo, desc: e.target.value } }, 'עודכן')}>${page.seo.desc}</textarea><//>
  </div>`;
}

function Collapse({ title, icon, sub, children }) {
  const [open, setOpen] = useState(false);
  return html`<div class="mb-2 rounded-xl border-[1.5px] border-line bg-white">
    <button type="button" class="flex w-full items-center gap-2 p-3 text-start cursor-pointer" aria-expanded=${open} onClick=${() => setOpen(!open)}>
      <${Icon} name=${icon} size=${16} />
      <span class="flex-1"><b class="block text-[14px]">${title}</b><small class="text-[12px] text-muted">${sub}</small></span>
      <${Icon} name=${open ? 'chevron-up' : 'chevron-down'} size=${16} />
    </button>
    ${open && html`<div class="border-t border-line p-3">${children}</div>`}
  </div>`;
}

// The link preview as it shows in a WhatsApp chat (picture = the top of the page).
export function SharePreview({ page }) {
  return html`<div class="overflow-hidden rounded-xl border border-line bg-[#e7f6e0] p-2">
    <div class="overflow-hidden rounded-lg bg-white">
      <${Thumb} page=${page} width=${1180} height=${600} />
      <div class="border-t border-line px-3 py-2">
        <p class="truncate text-[14px] font-bold text-ink">${page.seo.title}</p>
        <p class="line-clamp-2 text-[12px] text-muted">${page.seo.desc}</p>
        <p class="mt-0.5 text-[12px] text-faint" dir="ltr">${SUBDOMAIN}.${ROOT_DOMAIN}</p>
      </div>
    </div>
  </div>`;
}

// ---------- tab 4: the message check ----------

function CheckPanel({ page, scrollTo, onPhoto }) {
  const list = checksOf(page);
  const open = list.filter((c) => !c.ok).length;
  return html`<div>
    <div class=${cx('mb-4 rounded-xl p-3', open ? 'bg-warn-50' : 'bg-money-50')}>
      <p class=${cx('text-[15px] font-bold', open ? 'text-warn' : 'text-money')}>${open ? `${open} דברים לחזק לפני הפרסום` : 'המסר ברור. אפשר לפרסם'}</p>
      <p class="text-[13px] text-ink">הכריש בודק כל שינוי. הבדיקה לא חוסמת פרסום.</p>
    </div>
    <ul class="flex flex-col gap-2">
      ${list.map(
        (c) => html`<li key=${c.id} class="flex items-start gap-2.5 rounded-xl border-[1.5px] border-line bg-white p-2.5">
          <span class=${cx('mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full', c.ok ? (c.info ? 'bg-brand-100 text-brand-600' : 'bg-money-50 text-money') : 'bg-error-50 text-error')}>
            <${Icon} name=${c.ok ? (c.info ? 'info' : 'check') : 'alert-circle'} size=${15} />
          </span>
          <span class="min-w-0 flex-1">
            <b class="block text-[14px]">${c.label}</b>
            <span class="block text-[12px] text-muted">${c.hint}</span>
          </span>
          ${!c.ok && c.sec && html`<button type="button" class="shrink-0 text-[13px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${() => (c.photo ? onPhoto() : scrollTo(c.sec))}>לתיקון</button>`}
        </li>`,
      )}
    </ul>
  </div>`;
}

// ---------- the photo window ----------

export function PhotoSheet({ page, set, onClose }) {
  const file = useRef();
  const pick = (src, text) => {
    set({ photo: src }, text);
    onClose();
  };
  return html`<${Sheet} title="התמונה שלך" onClose=${onClose}>
    <p class="mb-4 text-[15px]">תמונה אמיתית שלך בונה אמון יותר מכל תמונה כללית. היא נשמרת בעסק ונכנסת לכל הדפים.</p>
    <input ref=${file} type="file" accept="image/*" class="hidden" onChange=${(e) => e.target.files[0] && pick(URL.createObjectURL(e.target.files[0]), 'התמונה הועלתה')} />
    <div class="flex flex-col gap-2.5">
      <button type="button" class="lp-option" onClick=${() => file.current.click()}>
        <span class="fb-chip-ic sketch-chip h-11 w-11"><${Icon} name="upload" size=${20} /></span>
        <span><b>העלאה מהמחשב או מהטלפון</b><small>JPG או PNG, עד 10MB. אפשר גם לצלם עכשיו.</small></span>
      </button>
      <button type="button" class="lp-option" onClick=${() => pick(USER.photo, 'התמונה השמורה חזרה')}>
        <img src=${USER.photo} alt="" class="h-11 w-11 rounded-lg object-cover" />
        <span><b>התמונה ששמורה בעסק</b><small>מההעלאה הקודמת</small></span>
      </button>
      ${page.photo &&
      html`<button type="button" class="lp-option" onClick=${() => pick(null, 'התמונה הוסרה')}>
        <span class="grid h-11 w-11 place-items-center rounded-lg bg-canvas text-muted"><${Icon} name="image-off" size=${20} /></span>
        <span><b>בלי תמונה</b><small>במקומה יופיע עיצוב בצבעי המותג</small></span>
      </button>`}
    </div>
    <div class="mt-4 rounded-xl bg-white p-3 text-[13px] text-muted">
      <b class="text-ink">מה עובד הכי טוב:</b> אור טבעי, מבט למצלמה, רקע שקט.
    </div>
  <//>`;
}
