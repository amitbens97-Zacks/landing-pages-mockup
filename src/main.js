// Task 3: landing pages. Two places:
//   1. the step "דף נחיתה בקליק" (step 9): opening, what goes into the page, the
//      template, the AI wait, the editor, the page is live. It builds the business page.
//   2. "הדפים שלי": all the pages, their links, views and leads, a new page per offer,
//      and the same editor for every page.
// Link params: ?screen=opening|data|template|wait|editor|done, ?view=pages|new|public
// (&page=business|p1|p2), ?embed = phone layout. Shift+D opens the developer notes.
import { html, render, useState, useEffect, useRef, Icon, cx } from './lib.js';
import { Logo, PartnerBubble, Progress, TopBar, BottomBar, Status, PrimaryButton, Button, Toast } from './components.js';
import { Tag, DeviceSwitch } from './ui.js';
import { PageView } from './page.js';
import { Editor } from './editor.js';
import { Opening, DataScreen, TemplateScreen, Wait, Done } from './screens.js';
import { PagesView, NewPage } from './pages.js';
import { DevPanel } from './devnotes.js';
import { initialPages, makePage, checksOf } from './state.js';
import { STEP, PARTS, PRODUCTS, pageUrl } from './data.js';
import { EMBED, IS_PHONE, readView, saveView, writeHandoff, takeHandoff, applyPhoneViewport, ViewToggle, PhonePreview } from './viewswitch.js';

const STORE = 'flowbiz-lp-pages-v1';
const params = new URLSearchParams(location.search);
const STEP_SCREENS = ['opening', 'data', 'template', 'wait', 'editor', 'done'];
const PART_OF = { opening: 0, data: 0, template: 1, wait: 1, editor: 2, done: 3 };

function startRoute() {
  const view = params.get('view');
  if (view === 'pages' || view === 'new') return { view };
  if (view === 'edit') return { view, pageId: params.get('page') || 'p1' };
  const screen = params.get('screen');
  return { view: 'step', screen: STEP_SCREENS.includes(screen) ? screen : 'opening' };
}

function loadPages() {
  try {
    const raw = sessionStorage.getItem(STORE);
    if (raw) return JSON.parse(raw);
  } catch {}
  return initialPages();
}

const NAV = [
  ['home', 'בית', 'house'],
  ['calendar', 'יומן', 'calendar-days'],
  ['tasks', 'משימות', 'list-checks'],
  ['finance', 'כספים', 'wallet'],
  ['files', 'קבצים', 'folder-open'],
  ['leads', 'לידים', 'users'],
  ['pages', 'הדפים שלי', 'layout-template'],
];

const PARTNER_MSG = {
  opening: 'הדף הזה הוא הכרטיס של העסק. נבנה אותו ממה שכבר כתבת, ונשאר לך רק לבחור עיצוב ולשנות מה שבא לך.',
  data: 'כמעט הכול כבר כאן. תמונה אמיתית שלך היא הדבר הכי חשוב שעוד חסר, היא בונה אמון יותר מכל טקסט.',
  template: 'ליועצים "סטודיו" עובד הכי טוב: נקי, והתמונה שלך ליד הכותרת. כל העיצובים כבר בצבעים שלך.',
  editor: 'לחיצה על כל טקסט בדף משנה אותו. ב"בדיקת מסר" אני מסמן מה כדאי לחזק לפני הפרסום.',
  done: 'הדף באוויר! השלב הבא: נכין תוכן ששולח אנשים לדף הזה.',
  pages: 'דף לכל הצעה עובד טוב יותר מדף אחד לכולם. אפשר להתחיל מההצעה המרכזית.',
};

function App({ view: shellView, onViewChange }) {
  const handoff = useRef(takeHandoff()).current;
  const [route, setRoute] = useState(handoff?.route || startRoute());
  const [pages, setPages] = useState(handoff?.pages || loadPages());
  const [undo, setUndo] = useState(null);
  const [save, setSave] = useState(null);
  const [toast, setToast] = useState(null);
  const [dev, setDev] = useState(false);
  const [unread, setUnread] = useState(true);
  const hist = useRef({});
  const timers = useRef({});

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify(pages));
    } catch {}
  }, [pages]);
  useEffect(() => {
    window.__flowbizSnapshot = () => ({ route, pages });
  });
  useEffect(() => {
    const q = new URLSearchParams();
    if (route.view === 'step') q.set('screen', route.screen);
    else q.set('view', route.view);
    if (route.view === 'edit') q.set('page', route.pageId);
    if (EMBED) q.set('embed', '1');
    history.replaceState(null, '', `${location.pathname}?${q}`);
    setUnread(true);
  }, [route.view, route.screen, route.pageId]);
  useEffect(() => {
    const k = (e) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
      if (e.key === 'D' && e.shiftKey && !typing) setDev((d) => !d);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !typing && editingId()) {
        e.preventDefault();
        e.shiftKey ? redo() : doUndo();
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  const notify = (text, icon = 'info') => {
    const id = Date.now();
    setToast({ id, text, icon });
    clearTimeout(timers.current.toast);
    timers.current.toast = setTimeout(() => setToast(null), 2600);
  };
  const go = (r) => setRoute(r);
  const step = (screen) => go({ view: 'step', screen });
  const editingId = () => (route.view === 'step' && ['data', 'template', 'editor'].includes(route.screen) ? 'business' : route.view === 'edit' ? route.pageId : null);
  const pageById = (id) => pages.find((p) => p.id === id);

  // Every change: history for undo, a short "saving" state, and an undo pill for 5 seconds.
  const update = (id, next, text) => {
    const prev = pageById(id);
    const h = (hist.current[id] ||= { past: [], future: [] });
    h.past = [...h.past.slice(-49), prev];
    h.future = [];
    setPages((list) => list.map((p) => (p.id === id ? (typeof next === 'function' ? next(p) : next) : p)));
    setSave('saving');
    clearTimeout(timers.current.save);
    timers.current.save = setTimeout(() => setSave('saved'), 500);
    if (text) {
      const u = { id: Date.now(), text, pageId: id };
      setUndo(u);
      clearTimeout(timers.current.undo);
      timers.current.undo = setTimeout(() => setUndo(null), 5000);
    }
  };
  const doUndo = () => {
    const id = editingId();
    const h = hist.current[id];
    if (!h?.past.length) return;
    const prev = h.past[h.past.length - 1];
    h.past = h.past.slice(0, -1);
    h.future = [pageById(id), ...h.future];
    setPages((list) => list.map((p) => (p.id === id ? prev : p)));
    setUndo(null);
  };
  const redo = () => {
    const id = editingId();
    const h = hist.current[id];
    if (!h?.future.length) return;
    const [next, ...rest] = h.future;
    h.future = rest;
    h.past = [...h.past, pageById(id)];
    setPages((list) => list.map((p) => (p.id === id ? next : p)));
  };
  const histOf = (id) => hist.current[id] || { past: [], future: [] };

  const preview = (id) => window.open(`${location.pathname}?view=public&page=${id}`, '_blank');

  const partner = html`<${PartnerBubble}
    message=${PARTNER_MSG[route.view === 'step' ? route.screen : route.view] || PARTNER_MSG.editor}
    unread=${unread}
    onRead=${() => setUnread(false)}
    mood=${route.screen === 'done' ? 'happy' : 'calm'}
  />`;

  // ---------- the step ----------
  if (route.view === 'step') {
    const page = pageById('business');
    const set = (patch, text) => update('business', { ...page, ...patch }, text);
    const s = route.screen;
    const part = PART_OF[s];
    const open = checksOf(page).filter((c) => !c.ok).length;
    const progress = html`<${Progress} parts=${PARTS} current=${part} maxReached=${part} done=${s === 'done'} onJump=${(i) => step(['data', 'template', 'editor', 'done'][i])} />`;
    const back = (to) => html`<${Button} variant="secondary" onClick=${() => step(to)}><${Icon} name="arrow-right" size=${18} />חזרה<//>`;
    const bars = {
      opening: { primary: html`<${PrimaryButton} label="מתחילים" onClick=${() => step('data')} />` },
      data: { back: back('opening'), primary: html`<${PrimaryButton} label="המשך" onClick=${() => step('template')} />`, hint: page.photo ? null : 'אפשר להמשיך גם בלי תמונה' },
      template: { back: back('data'), primary: html`<${PrimaryButton} label="יצירת הדף" onClick=${() => step('wait')} />` },
      wait: { hint: 'הכריש בונה את הדף' },
      editor: {
        back: back('template'),
        primary: html`<${PrimaryButton} label="פרסום הדף" check onClick=${() => (update('business', { ...page, status: 'live' }), step('done'))} />`,
        hint: open ? `${open} הצעות לשיפור ב"בדיקת מסר"` : 'המסר ברור',
      },
      done: { extra: html`<${Button} variant="text" onClick=${() => go({ view: 'pages' })}><${Icon} name="layout-grid" size=${16} />הדפים שלי<//>`, primary: html`<${PrimaryButton} label="לשלב הבא" onClick=${() => notify('השלב הבא: מכונת תוכן שיווקי (שלב 10)', 'arrow-left')} />` },
    }[s];
    return html`<div class="fb-notebook flex h-dvh flex-col text-ink" dir="rtl">
      <${TopBar}
        step=${{ ...STEP, icon: 'layout-template' }}
        progress=${progress}
        tools=${!EMBED && html`<${ViewToggle} view=${shellView} onChange=${onViewChange} />`}
        onHome=${() => notify('במוק-אפ: מעבר לדף הבית', 'house')}
      />
      ${s === 'editor'
        ? html`<${Editor}
            page=${page}
            pages=${pages}
            onChange=${(next, text) => update('business', next, text)}
            onUndo=${doUndo}
            onRedo=${redo}
            canUndo=${histOf('business').past.length > 0}
            canRedo=${histOf('business').future.length > 0}
            onPreview=${() => preview('business')}
            notify=${notify}
          />`
        : html`<main class="thin-scroll relative min-h-0 flex-1 overflow-y-auto">
            ${s === 'opening' && html`<${Opening} page=${page} />`}
            ${s === 'data' && html`<${DataScreen} page=${page} set=${set} />`}
            ${s === 'template' && html`<${TemplateScreen} page=${page} set=${set} />`}
            ${s === 'wait' && html`<${Wait} onDone=${() => step('editor')} />`}
            ${s === 'done' && html`<${Done} page=${page} onPages=${() => go({ view: 'pages' })} notify=${notify} />`}
            ${partner}
          </main>`}
      <${BottomBar}
        back=${bars.back}
        extra=${bars.extra}
        status=${html`<${Status} undo=${undo} onUndo=${doUndo} save=${s === 'editor' || s === 'data' ? save : null} hint=${bars.hint} />`}
        primary=${bars.primary}
      />
      <${Toast} toast=${toast} />
      <${DevPanel} open=${dev} onClose=${() => setDev(false)} onJump=${jump} />
    </div>`;
  }

  function jump(id) {
    setDev(false);
    if (id === 'public') return preview('business');
    if (id === 'pages' || id === 'new') return go({ view: id });
    step(id);
  }

  // ---------- "הדפים שלי" and the editor outside the step ----------
  const header = html`<header class="no-print z-20 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface px-3 md:px-6">
    <${Logo} size="sm" />
    <nav class="ms-4 hidden items-center gap-1 lg:flex">
      ${NAV.map(
        ([id, label, icon]) => html`<button
          key=${id}
          type="button"
          class=${cx('relative inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-[14px] font-bold cursor-pointer', id === 'pages' ? 'bg-brand-100 text-brand-600' : 'text-muted hover:bg-brand-50 hover:text-brand-700')}
          onClick=${() => (id === 'pages' ? go({ view: 'pages' }) : notify('במוק-אפ רק "הדפים שלי" פעיל', 'info'))}
        >
          <${Icon} name=${icon} size=${17} />${label}
          ${id === 'pages' && html`<span class="rounded-full bg-gold px-1.5 text-[10px] font-black text-ink">חדש</span>`}
        </button>`,
      )}
    </nav>
    <span class="font-display text-[17px] font-bold lg:hidden">הדפים שלי</span>
    <div class="ms-auto flex items-center gap-2">
      ${!EMBED && html`<${ViewToggle} view=${shellView} onChange=${onViewChange} />`}
      <button type="button" onClick=${() => setDev((d) => !d)} title="הערות למפתחים (Shift+D)" aria-label="הערות למפתחים" class="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-brand-50 hover:text-brand-600 cursor-pointer"><${Icon} name="code-xml" size=${18} /></button>
    </div>
  </header>`;

  let body;
  if (route.view === 'pages')
    body = html`<main class="thin-scroll relative min-h-0 flex-1 overflow-y-auto">
      <${PagesView}
        pages=${pages}
        notify=${notify}
        onEdit=${(id) => go({ view: 'edit', pageId: id })}
        onNew=${() => go({ view: 'new' })}
        onUpdate=${(id, patch, text) => (setPages((l) => l.map((p) => (p.id === id ? { ...p, ...patch } : p))), notify(text, 'check'))}
        onDuplicate=${(id) => {
          const src = pageById(id);
          const copy = { ...JSON.parse(JSON.stringify(src)), id: `${src.id}-copy-${Date.now() % 1000}`, name: `${src.name} (עותק)`, slug: `${src.slug || 'home'}-2`, status: 'draft', stats: { views: 0, leads: 0, trend: [0, 0, 0, 0, 0, 0, 0] } };
          setPages((l) => [...l, copy]);
          notify('נוצר עותק כטיוטה', 'copy-plus');
        }}
        onDelete=${(id) => (setPages((l) => l.filter((p) => p.id !== id)), notify('הדף נמחק', 'trash-2'))}
      />
      ${partner}
    </main>`;
  else if (route.view === 'new')
    body = html`<main class="thin-scroll relative min-h-0 flex-1 overflow-y-auto">
      <${NewPage}
        pages=${pages}
        onCancel=${() => go({ view: 'pages' })}
        onCreate=${(productId, template) => {
          const exists = pages.find((p) => p.id === productId);
          const fresh = { ...makePage('offer', productId, template), stats: { views: 0, leads: 0, trend: [0, 0, 0, 0, 0, 0, 0] } };
          if (exists) fresh.id = `${productId}-${Date.now() % 1000}`, (fresh.slug = `${fresh.slug}-2`);
          fresh.photo = pageById('business')?.photo ?? fresh.photo;
          fresh.theme = { ...(pageById('business')?.theme || fresh.theme) };
          setPages((l) => [...l, fresh]);
          go({ view: 'creating', pageId: fresh.id });
        }}
      />
    </main>`;
  else if (route.view === 'creating')
    body = html`<main class="fb-notebook min-h-0 flex-1 overflow-y-auto"><${Wait} short onDone=${() => go({ view: 'edit', pageId: route.pageId })} /></main>`;
  else if (route.view === 'edit') {
    const page = pageById(route.pageId) || pages[0];
    const h = histOf(page.id);
    body = html`<div class="flex min-h-0 flex-1 flex-col">
      <div class="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-3 md:px-5">
        <button type="button" class="inline-flex items-center gap-1.5 text-[14px] font-bold text-brand-600 cursor-pointer" onClick=${() => go({ view: 'pages' })}><${Icon} name="arrow-right" size=${16} /><span class="max-sm:hidden">הדפים שלי</span></button>
        <span class="h-6 w-px bg-line"></span>
        <b class="min-w-0 truncate font-display text-[16px]">${page.name}</b>
        <${Tag} tone=${page.status === 'live' ? 'live' : 'draft'}>${page.status === 'live' ? 'באוויר' : 'טיוטה'}<//>
        <span class="ms-auto max-md:hidden"><${Status} undo=${undo} onUndo=${doUndo} save=${save} /></span>
        <${Button}
          class="max-md:ms-auto !h-10 !px-4 !text-[15px]"
          onClick=${() => {
            update(page.id, { ...page, status: 'live' });
            notify(page.status === 'live' ? 'הדף באוויר עודכן' : `הדף באוויר: ${pageUrl(page.slug)}`, 'globe');
            go({ view: 'pages' });
          }}
        >${page.status === 'live' ? 'עדכון הדף' : 'פרסום הדף'}<//>
      </div>
      <${Editor}
        key=${page.id}
        page=${page}
        pages=${pages}
        onChange=${(next, text) => update(page.id, next, text)}
        onUndo=${doUndo}
        onRedo=${redo}
        canUndo=${h.past.length > 0}
        canRedo=${h.future.length > 0}
        onPreview=${() => preview(page.id)}
        notify=${notify}
      />
    </div>`;
  }

  return html`<div class="fb-notebook flex h-dvh flex-col text-ink" dir="rtl">
    ${header}${body}
    <${Toast} toast=${toast} />
    <${DevPanel} open=${dev} onClose=${() => setDev(false)} onJump=${jump} />
  </div>`;
}

// ---------- the page as customers see it (opened by "תצוגה מקדימה") ----------

function PublicView() {
  const pages = loadPages();
  const page = pages.find((p) => p.id === params.get('page')) || pages[0];
  const [device, setDevice] = useState(window.innerWidth < 768 ? 'mobile' : 'desktop');
  const small = window.innerWidth < 768;
  return html`<div class="flex h-dvh flex-col" dir="rtl">
    <div class="flex h-12 shrink-0 items-center gap-3 bg-ink px-3 text-[13px] font-semibold text-white md:px-5">
      <${Icon} name="eye" size=${16} />
      <span class="max-sm:hidden">תצוגה מקדימה · כך הלקוחות רואים את הדף</span>
      <span class="truncate opacity-75" dir="ltr">${pageUrl(page.slug)}</span>
      ${!small && html`<span class="ms-auto"><${DeviceSwitch} value=${device} onChange=${setDevice} /></span>`}
    </div>
    <div class="thin-scroll min-h-0 flex-1 overflow-y-auto bg-[#ebe7dd]">
      <div class=${cx('mx-auto bg-white', device === 'mobile' && !small && 'my-6 w-[390px] overflow-hidden rounded-[30px] shadow-2xl')}>
        <${PageView} page=${page} pages=${pages} narrow=${device === 'mobile' || small} />
      </div>
    </div>
  </div>`;
}

function Root() {
  const [view, setView] = useState(readView);
  useEffect(() => applyPhoneViewport(view), [view]);
  const change = (v) => {
    if (v === 'mobile') {
      try {
        writeHandoff(window.__flowbizSnapshot?.());
      } catch {}
    }
    saveView(v);
    setView(v);
  };
  if (!EMBED && !IS_PHONE && view === 'mobile') return html`<${PhonePreview} onSwitch=${change} />`;
  return html`<${App} view=${view} onViewChange=${change} />`;
}

applyPhoneViewport(readView());
render(params.get('view') === 'public' ? html`<${PublicView} />` : html`<${Root} />`, document.getElementById('app'));
