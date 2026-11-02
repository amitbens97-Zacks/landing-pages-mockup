// The landing page itself: one renderer, six templates. The template sets the fonts,
// the hero, the section styles, the corners and the buttons; the colors always come
// from the user's logo (page.theme). With `editable` every text is edited in place,
// a click selects a section, and a click on a photo opens the photo window.
// Background photos are shown in grey and tinted with the logo's main color, so any
// photo fits the brand and white text always reads on it.
import { html, useState, useEffect, useRef, Icon, cx } from './lib.js';
import { templateOf, FONT_PAIRS, SECTION_TYPES, USER, PRODUCTS, ALTERNATIVES, pageUrl, bgSrc } from './data.js';

// ---------- colors ----------
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (a) => '#' + a.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => {
  const A = rgb(a);
  const B = rgb(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
};
const lum = (h) => {
  const [r, g, b] = rgb(h).map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const onColor = (h) => (lum(h) > 0.55 ? '#14231f' : '#ffffff');

export function themeOf(page) {
  const t = templateOf(page.template);
  const P = page.theme.primary;
  const A = page.theme.accent;
  const fp = FONT_PAIRS.find((f) => f.id === page.theme.font && f.head);
  const head = fp?.head || t.head;
  const body = fp?.body || t.body;
  const dark = t.bg === 'dark';
  const bg = dark ? mix(P, '#000000', 0.8) : t.bg === 'cream' ? '#fbf7f0' : t.bg === 'tint' ? mix(P, '#ffffff', 0.93) : '#ffffff';
  const ink = dark ? '#f4f1e8' : mix(P, '#0b0f0e', 0.72);
  const muted = dark ? 'rgba(244,241,232,.74)' : mix(ink, '#ffffff', 0.32);
  const alt = dark ? mix(P, '#000000', 0.7) : t.bg === 'tint' ? '#ffffff' : t.bg === 'cream' ? '#f3ebdd' : mix(P, '#ffffff', 0.945);
  const card = dark ? mix(P, '#000000', 0.62) : '#ffffff';
  const line = dark ? 'rgba(255,255,255,.14)' : mix(P, '#ffffff', 0.8);
  const btnStyle = page.theme.btn || t.btn;
  const btnBg = dark ? A : P;
  return {
    t, P, A, head, body, dark, bg, ink, muted, alt, card, line,
    btnBg, btnFg: onColor(btnBg),
    radius: t.radius,
    btnR: btnStyle === 'pill' ? 999 : btnStyle === 'square' ? 3 : 12,
    onP: onColor(P),
    tint: mix(P, '#ffffff', 0.88),
    accentSoft: dark ? mix(A, '#000000', 0.55) : mix(A, '#ffffff', 0.78),
  };
}

// ---------- paths into the content ----------
export const getPath = (o, path) => path.split('.').reduce((v, k) => (v == null ? v : v[k]), o);
export function setPath(o, path, value) {
  const keys = path.split('.');
  const copy = Array.isArray(o) ? [...o] : { ...o };
  let cur = copy;
  keys.slice(0, -1).forEach((k) => {
    cur[k] = Array.isArray(cur[k]) ? [...cur[k]] : { ...cur[k] };
    cur = cur[k];
  });
  cur[keys[keys.length - 1]] = value;
  return copy;
}

// ---------- small pieces ----------

// Editable text. Enter (Ctrl+Enter in long texts) or leaving the text saves; Esc restores.
// Keyed by its value, so a saved change always re-renders a clean node.
function T({ x, path, tag = 'span', class: cls = '', style, multiline, sec }) {
  const value = getPath(x.page.content, path) ?? '';
  if (!x.editable) return html`<${tag} class=${cls} style=${style}>${value}<//>`;
  return html`<${tag}
    key=${value}
    class=${cx(cls, 'lp-edit')}
    style=${style}
    contenteditable="true"
    spellcheck=${false}
    data-path=${path}
    onFocus=${() => x.onSelect(sec)}
    onBlur=${(e) => {
      const v = e.currentTarget.innerText.replace(/\s+\n/g, '\n').trim();
      if (v !== value) x.onEdit(path, v);
    }}
    onKeyDown=${(e) => {
      if (e.key === 'Enter' && (!multiline || e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.currentTarget.blur();
      }
      if (e.key === 'Escape') {
        e.currentTarget.innerText = value;
        e.currentTarget.blur();
      }
    }}
  >${value}<//>`;
}

// The user's logo (from "שם ולוגו"): the mark in the brand colors and the name.
export function LogoMark({ P, A, size = 34 }) {
  return html`<svg width=${size} height=${size} viewBox="0 0 40 40" aria-hidden="true" class="shrink-0">
    <rect x="1" y="1" width="38" height="38" rx="11" fill=${P} />
    <rect x="9" y="22" width="5" height="9" rx="2" fill="#fff" opacity=".75" />
    <rect x="17.5" y="17" width="5" height="14" rx="2" fill="#fff" opacity=".9" />
    <rect x="26" y="11" width="5" height="20" rx="2" fill=${A} />
    <path d="M8 16 L18 9 L23 13 L32 6" stroke=${A} stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`;
}

function Btn({ x, th, path, sec, ghost, small, onClick }) {
  const style = ghost
    ? { border: `1.5px solid ${th.dark ? 'rgba(255,255,255,.5)' : th.P}`, color: th.dark ? '#fff' : th.P, background: 'transparent', borderRadius: th.btnR }
    : { background: th.btnBg, color: th.btnFg, borderRadius: th.btnR, boxShadow: th.t.id === 'bold' ? `4px 4px 0 ${th.A}` : '0 6px 16px -8px rgba(0,0,0,.35)' };
  return html`<span
    data-cta
    class=${cx('inline-flex items-center justify-center gap-2 font-bold', !x.editable && 'cursor-pointer', small ? 'h-10 px-4 text-[14px]' : 'h-[52px] px-6 text-[17px]')}
    style=${{ ...style, fontFamily: th.body }}
    onClick=${onClick}
  >
    ${path ? html`<${T} x=${x} path=${path} sec=${sec} />` : null}
    ${!ghost && html`<${Icon} name="arrow-left" size=${18} />`}
  </span>`;
}

function Photo({ x, th, class: cls = '', style = {}, round, sec }) {
  const src = x.page.photo;
  const click = (e) => {
    if (!x.editable) return;
    e.stopPropagation();
    x.onSelect(sec);
    x.onPhoto();
  };
  const r = round ? '999px' : `${Math.max(th.radius, 6)}px`;
  if (!src)
    return html`<div
      class=${cx('grid place-items-center text-center', x.editable && 'lp-photo cursor-pointer', cls)}
      style=${{ borderRadius: r, background: th.dark ? 'rgba(255,255,255,.06)' : th.tint, border: `2px dashed ${th.dark ? 'rgba(255,255,255,.25)' : mix(th.P, '#ffffff', 0.55)}`, color: th.dark ? '#fff' : th.P, ...style }}
      onClick=${click}
    >
      <span class="flex flex-col items-center gap-1.5 p-3 text-[14px] font-bold" style=${{ fontFamily: th.body }}>
        <${Icon} name="camera" size=${26} />${x.editable ? 'התמונה שלך' : ''}
      </span>
    </div>`;
  return html`<div class=${cx('relative overflow-hidden', x.editable && 'lp-photo cursor-pointer', cls)} style=${{ borderRadius: r, ...style }} onClick=${click}>
    <img src=${src} alt=${`${USER.fullName}`} class="block h-full w-full object-cover" draggable="false" />
    ${x.editable && html`<span class="lp-photo-tip"><${Icon} name="image" size=${15} />החלפת תמונה</span>`}
  </div>`;
}

const H2 = ({ x, th, path, sec, center, size }) =>
  html`<${T}
    x=${x}
    path=${path}
    sec=${sec}
    tag="h2"
    class=${cx('mb-3 leading-[1.15]', center && 'text-center')}
    style=${{ fontFamily: th.head, fontWeight: th.t.id === 'bold' ? 900 : 700, fontSize: `${size || (x.narrow ? 28 : th.t.id === 'bold' ? 44 : 38)}px`, color: th.ink, letterSpacing: th.t.id === 'bold' ? '-0.02em' : 0 }}
  />`;

// The page's background photo: grey, the main color over it, and a darker side under the text.
export function BgPhoto({ th, src, narrow, tile }) {
  const deep = mix(th.P, '#000000', 0.5);
  if (tile)
    return html`<div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <img src=${src} alt="" class="h-full w-full object-cover" style=${{ filter: 'grayscale(1) contrast(1.08) brightness(1.15)' }} draggable="false" />
      <div class="absolute inset-0" style=${{ background: th.P, mixBlendMode: 'multiply' }}></div>
    </div>`;
  return html`<div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <img src=${src} alt="" class="h-full w-full object-cover" style=${{ filter: 'grayscale(1) contrast(1.08)' }} draggable="false" />
    <div class="absolute inset-0" style=${{ background: th.P, mixBlendMode: 'multiply' }}></div>
    <div class="absolute inset-0" style=${{ background: narrow ? `linear-gradient(${deep}cc, ${deep}e6)` : `linear-gradient(to left, ${deep}f0 0%, ${deep}c4 50%, ${deep}5c 100%)` }}></div>
  </div>`;
}

// Where the background photo shows: the message band always; the hero and the
// contact section in the templates that have a full color there (bold, luxe).
export const photoIn = (page, type) => !!bgSrc(page.bg) && (type === 'band' || ((type === 'hero' || type === 'contact') && ['block', 'dark'].includes(templateOf(page.template).hero)));

// ---------- section frame (selection and tools in the editor) ----------

function Sec({ x, th, id, type, bg, pad = true, children }) {
  const sel = x.editable && x.selected === id;
  const hidden = x.page.sections.find((s) => s.id === id)?.hidden;
  const photo = photoIn(x.page, type) ? bgSrc(x.page.bg) : null;
  return html`<section
    data-sec=${id}
    class=${cx('lp-sec relative', x.editable && 'lp-sec-ed', sel && 'is-sel', hidden && 'is-hidden')}
    style=${{ background: bg ?? th.bg, color: photo ? '#fff' : th.ink }}
    onClick=${() => x.editable && x.onSelect(id)}
  >
    ${photo && html`<${BgPhoto} th=${th} src=${photo} narrow=${x.narrow} />`}
    ${x.editable && html`<${SecTools} x=${x} id=${id} type=${type} sel=${sel} photo=${!!photo || type === 'band'} />`}
    <div class="relative mx-auto" style=${{ maxWidth: '1080px', padding: pad ? (x.narrow ? '44px 20px' : '84px 48px') : 0 }}>${children}</div>
  </section>`;
}

function SecTools({ x, id, type, sel, photo }) {
  const meta = SECTION_TYPES[type];
  const list = x.page.sections.filter((s) => !s.hidden || s.id === id);
  const i = x.page.sections.findIndex((s) => s.id === id);
  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn();
  };
  const tool = (icon, label, fn, on = true) =>
    on &&
    html`<button type="button" title=${label} aria-label=${label} class="lp-tool" onClick=${stop(fn)}><${Icon} name=${icon} size=${15} /><span class="max-[520px]:hidden">${label}</span></button>`;
  return html`<div class=${cx('lp-tools', sel && 'is-on')} dir="rtl" onClick=${(e) => e.stopPropagation()}>
    <span class="lp-tools-name"><${Icon} name=${meta.icon} size=${14} />${meta.label}</span>
    ${sel &&
    html`${tool('arrow-up', 'למעלה', () => x.onMove(id, -1), !meta.fixed && i > 1)}
      ${tool('arrow-down', 'למטה', () => x.onMove(id, 1), !meta.fixed && i < x.page.sections.length - 2)}
      ${tool('sparkles', 'נוסח אחר', () => x.onRewrite(id, type), !!ALTERNATIVES[type])}
      ${tool('calendar-check', x.page.content.offer?.seats?.on ? 'בלי מקומות פנויים' : 'מקומות פנויים', () => x.onSeats(), type === 'offer')}
      ${tool('image', 'תמונת רקע', () => x.onBg?.(), photo)}
      ${tool('eye-off', 'הסתרה', () => x.onHide(id), !meta.fixed)}`}
  </div>`;
}

// ---------- the page ----------

export function PageView({ page, editable = false, narrow = false, mid = false, selected, onSelect = () => {}, onEdit = () => {}, onMove, onHide, onRewrite, onPhoto, onBg, onAddTestimonial, onSeats, sticky = true, pages = [] }) {
  const th = themeOf(page);
  const x = { page, editable, narrow, mid, selected, onSelect, onEdit, onMove, onHide, onRewrite, onPhoto, onBg, onAddTestimonial, onSeats, pages };
  const shown = page.sections.filter((s) => editable || !s.hidden);
  // On the live page every call to action leads to the contact form.
  const toContact = (e) => {
    if (editable || !e.target.closest('[data-cta]') || e.target.closest('form')) return;
    e.currentTarget.querySelector('[data-sec^="contact"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return html`<div class="lp-page relative" dir="rtl" onClick=${toContact} style=${{ background: th.bg, color: th.ink, fontFamily: th.body, fontSize: narrow ? '16px' : '18px', lineHeight: 1.6 }}>
    <${PageHeader} x=${x} th=${th} />
    ${shown.map((s) => {
      const C = SECTIONS[s.type];
      if (!C) return null;
      if (s.type === 'testimonials' && !editable && !(page.content.testimonials?.items || []).length) return null;
      return html`<${C} key=${s.id} x=${x} th=${th} id=${s.id} type=${s.type} />`;
    })}
    <${Footer} x=${x} th=${th} />
    ${narrow && sticky && !editable && html`<${StickyBar} th=${th} page=${page} />`}
  </div>`;
}

function PageHeader({ x, th }) {
  const solid = th.t.hero === 'block';
  const fg = solid ? th.onP : th.ink;
  return html`<header style=${{ background: solid ? th.P : th.t.hero === 'dark' ? th.bg : 'transparent', color: fg }}>
    <div class="mx-auto flex items-center justify-between gap-3" style=${{ maxWidth: '1080px', padding: x.narrow ? '14px 20px' : '20px 48px' }}>
      <span class="flex items-center gap-2.5">
        <${LogoMark} P=${solid ? th.A : th.P} A=${solid ? '#ffffff' : th.A} size=${x.narrow ? 30 : 36} />
        <span style=${{ fontFamily: th.head, fontWeight: 800, fontSize: x.narrow ? '17px' : '20px' }}>${USER.business}</span>
      </span>
      ${!x.narrow && html`<span class="flex items-center gap-6 text-[15px] font-semibold" style=${{ opacity: 0.85 }}>
        <span>${USER.phone}</span>
        <span data-cta class=${cx('inline-flex h-10 items-center rounded-full px-4 font-bold', !x.editable && 'cursor-pointer')} style=${{ border: `1.5px solid ${solid ? th.onP : th.dark ? 'rgba(255,255,255,.4)' : th.line}` }}>יצירת קשר</span>
      </span>`}
    </div>
  </header>`;
}

// ---------- hero, one per template ----------

function Hero({ x, th: theme, id }) {
  let th = theme;
  const n = x.narrow;
  // The facts from "נעים להכיר", repeated under the button (they change there).
  const creds = x.page.content.about?.creds || [];
  const text = (center, light) => html`<div class=${cx('min-w-0', center && 'text-center')}>
    <${T} x=${x} sec=${id} path="hero.eyebrow" tag="p" class="mb-3 font-bold" style=${{ color: light ? th.onP : th.dark ? th.A : th.P, fontSize: n ? '14px' : '16px', letterSpacing: '0.02em', opacity: light ? 0.85 : 1 }} />
    <${T}
      x=${x}
      sec=${id}
      path="hero.title"
      tag="h1"
      class="mb-4"
      style=${{
        fontFamily: th.head,
        fontWeight: th.t.id === 'bold' ? 900 : th.t.head === 'Frank Ruhl Libre' ? 700 : 800,
        fontSize: `${n ? (th.t.id === 'bold' ? 40 : 34) : x.mid ? (th.t.id === 'bold' ? 52 : 44) : th.t.id === 'bold' ? 68 : th.t.id === 'minimal' ? 54 : 56}px`,
        lineHeight: 1.08,
        letterSpacing: th.t.id === 'bold' ? '-0.03em' : '-0.01em',
        color: light ? th.onP : th.ink,
      }}
    />
    <${T} x=${x} sec=${id} path="hero.sub" tag="p" multiline class=${cx('mb-7', center && 'mx-auto')} style=${{ color: light ? th.onP : th.muted, fontSize: n ? '17px' : '20px', maxWidth: '560px', opacity: light ? 0.9 : 1 }} />
    <div class=${cx('flex flex-wrap items-center gap-3', center && 'justify-center')}>
      <${Btn} x=${x} th=${light ? { ...th, btnBg: th.A, btnFg: onColor(th.A) } : th} path="hero.cta" sec=${id} />
      <span class="inline-flex items-center gap-1.5 text-[15px] font-semibold" style=${{ color: light ? th.onP : th.muted }}><${Icon} name="message-circle" size=${17} />${USER.phone}</span>
    </div>
    ${creds.length > 0 &&
    html`<ul class=${cx('mt-7 flex flex-wrap gap-x-5 gap-y-1.5 text-[14px] font-semibold', center && 'justify-center')} style=${{ color: light ? th.onP : th.muted, opacity: light ? 0.9 : 1 }}>
      ${creds.map((c, i) => html`<li key=${i} class="inline-flex items-center gap-1.5"><span class="inline-flex" style=${{ color: light || th.dark ? th.A : th.P }}><${Icon} name="check" size=${15} /></span>${c}</li>`)}
    </ul>`}
  </div>`;

  const kind = th.t.hero;
  if (kind === 'block' && photoIn(x.page, 'hero')) th = { ...th, onP: '#ffffff' };
  if (kind === 'split' || kind === 'dark')
    return html`<${Sec} x=${x} th=${th} id=${id} type="hero" bg=${th.bg}>
      <div class=${cx('grid items-center', n ? 'gap-8' : 'grid-cols-[1.15fr_0.85fr] gap-14')} style=${{ marginTop: n ? '-12px' : '-36px' }}>
        ${text(false)}
        <div class="relative">
          <div class="absolute" style=${{ inset: n ? '18px -10px -14px 18px' : '28px -22px -22px 28px', background: kind === 'dark' ? 'transparent' : th.accentSoft, border: kind === 'dark' ? `1.5px solid ${th.A}` : 0, borderRadius: `${th.radius + 6}px` }}></div>
          <${Photo} x=${x} th=${th} sec=${id} class="relative" style=${{ aspectRatio: n ? '4 / 3.4' : '4 / 4.6' }} />
        </div>
      </div>
    <//>`;
  if (kind === 'portrait')
    return html`<${Sec} x=${x} th=${th} id=${id} type="hero" bg=${th.bg}>
      <div class="flex flex-col items-center" style=${{ marginTop: n ? '-8px' : '-30px' }}>
        <div class="relative mb-7">
          <span class="absolute rounded-full" style=${{ inset: '-10px', border: `2px solid ${th.A}` }}></span>
          <${Photo} x=${x} th=${th} sec=${id} round style=${{ width: n ? '150px' : '200px', height: n ? '150px' : '200px' }} />
        </div>
        ${text(true)}
      </div>
    <//>`;
  if (kind === 'block')
    return html`<${Sec} x=${x} th=${photoIn(x.page, 'hero') ? { ...th, onP: '#ffffff' } : th} id=${id} type="hero" bg=${th.P}>
      <div class=${cx('grid items-center', n ? 'gap-8' : 'grid-cols-[1.3fr_0.7fr] gap-12')} style=${{ marginTop: n ? '-12px' : '-30px' }}>
        ${text(false, true)}
        <div class="relative" style=${{ transform: n ? 'none' : 'rotate(-2.5deg)' }}>
          <div class="absolute" style=${{ inset: '16px -16px -16px 16px', background: th.A }}></div>
          <${Photo} x=${x} th=${{ ...th, radius: 0 }} sec=${id} class="relative" style=${{ aspectRatio: n ? '4 / 3.4' : '4 / 5', border: '6px solid #fff' }} />
        </div>
      </div>
    <//>`;
  if (kind === 'center')
    return html`<${Sec} x=${x} th=${th} id=${id} type="hero" bg=${th.bg}>
      <div class="mx-auto flex max-w-[780px] flex-col items-center text-center" style=${{ marginTop: n ? 0 : '-10px', paddingBottom: n ? 0 : '20px' }}>
        <div class="mb-6 flex items-center gap-3">
          <${Photo} x=${x} th=${th} sec=${id} round style=${{ width: '56px', height: '56px' }} />
          <span class="text-start text-[15px] leading-tight"><b style=${{ color: th.ink }}>${USER.fullName}</b><br /><span style=${{ color: th.muted }}>${USER.role}</span></span>
        </div>
        ${text(true)}
        <div class="mt-10 h-px w-full" style=${{ background: th.line }}></div>
      </div>
    <//>`;
  // cards (soft)
  return html`<${Sec} x=${x} th=${th} id=${id} type="hero" bg=${th.bg}>
    <div class=${cx('grid items-center overflow-hidden', n ? 'gap-6 p-6' : 'grid-cols-[1.1fr_0.9fr] gap-10 p-12')} style=${{ background: '#fff', borderRadius: `${th.radius + 8}px`, marginTop: n ? '-16px' : '-40px', boxShadow: '0 20px 50px -30px rgba(0,0,0,.25)' }}>
      ${text(false)}
      <${Photo} x=${x} th=${th} sec=${id} style=${{ aspectRatio: n ? '4 / 3.2' : '1 / 1', borderRadius: n ? `${th.radius}px` : '46% 54% 40% 60% / 52% 44% 56% 48%' }} />
    </div>
  <//>`;
}

// ---------- the other sections ----------

function Pain({ x, th, id }) {
  const items = x.page.content.pain.items;
  const bold = th.t.id === 'bold';
  const lines = th.t.id === 'minimal' || th.t.id === 'luxe';
  return html`<${Sec} x=${x} th=${th} id=${id} type="pain" bg=${th.alt}>
    <${H2} x=${x} th=${th} path="pain.title" sec=${id} center=${!lines} />
    <div class=${cx('mt-8 grid gap-4', !x.narrow && (lines ? 'grid-cols-1' : 'grid-cols-3'))}>
      ${items.map(
        (_, i) => html`<div
          key=${i}
          class="flex items-start gap-3"
          style=${lines
            ? { borderBottom: `1px solid ${th.line}`, padding: '18px 0' }
            : { background: bold ? th.ink : th.card, color: bold ? '#fff' : th.ink, borderRadius: `${th.radius}px`, padding: '22px', border: bold ? 0 : `1px solid ${th.line}` }}
        >
          <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full font-bold" style=${{ background: bold ? th.A : th.accentSoft, color: bold ? onColor(th.A) : th.dark ? '#fff' : th.ink }}>${bold ? i + 1 : html`<${Icon} name="x" size=${16} />`}</span>
          <${T} x=${x} sec=${id} path=${`pain.items.${i}`} tag="p" multiline class="font-semibold" style=${{ fontSize: x.narrow ? '17px' : '19px' }} />
        </div>`,
      )}
    </div>
  <//>`;
}

// The main message from "דף המסרים", over the background photo.
function Band({ x, th, id }) {
  const b = x.page.content.band;
  const photo = photoIn(x.page, 'band');
  const light = { ...th, btnBg: th.A, btnFg: onColor(th.A) };
  return html`<${Sec} x=${x} th=${th} id=${id} type="band" bg=${mix(th.P, '#000000', 0.35)}>
    <div class=${cx('max-w-[720px]', x.narrow ? 'py-4' : 'py-6')} style=${{ color: '#fff' }}>
      <${T} x=${x} sec=${id} path="band.kicker" tag="p" multiline class="mb-3 font-bold" style=${{ color: photo ? th.A : mix(th.A, '#ffffff', 0.2), fontSize: x.narrow ? '17px' : '20px' }} />
      <${T}
        x=${x}
        sec=${id}
        path="band.text"
        tag="p"
        multiline
        class="mb-8"
        style=${{ fontFamily: th.head, fontWeight: th.t.id === 'bold' ? 900 : 800, fontSize: `${x.narrow ? 30 : 46}px`, lineHeight: 1.15, letterSpacing: '-0.01em' }}
      />
      <${Btn} x=${x} th=${light} path="band.cta" sec=${id} />
    </div>
  <//>`;
}

function Method({ x, th, id }) {
  const m = x.page.content.method;
  return html`<${Sec} x=${x} th=${th} id=${id} type="method">
    <div class="text-center">
      <${H2} x=${x} th=${th} path="method.title" sec=${id} center />
      <${T} x=${x} sec=${id} path="method.sub" tag="p" class="mx-auto" style=${{ color: th.muted, maxWidth: '560px' }} />
    </div>
    <div class=${cx('mt-10 grid gap-6', !x.narrow && 'grid-cols-3')}>
      ${m.steps.map(
        (s, i) => html`<div key=${i} class="relative" style=${{ textAlign: x.narrow ? 'start' : 'center' }}>
          <div class=${cx('flex items-center gap-4', !x.narrow && 'flex-col')}>
            <span class="grid h-14 w-14 shrink-0 place-items-center text-[22px] font-black" style=${{ fontFamily: th.head, background: th.P, color: th.onP, borderRadius: th.t.id === 'bold' || th.t.id === 'luxe' ? '2px' : '999px', boxShadow: `0 0 0 6px ${th.tint}${th.dark ? '22' : ''}` }}>${i + 1}</span>
            <div>
              <${T} x=${x} sec=${id} path=${`method.steps.${i}.t`} tag="h3" class="mb-1" style=${{ fontFamily: th.head, fontWeight: 800, fontSize: '22px' }} />
              <${T} x=${x} sec=${id} path=${`method.steps.${i}.d`} tag="p" multiline style=${{ color: th.muted }} />
            </div>
          </div>
        </div>`,
      )}
    </div>
  <//>`;
}

function Services({ x, th, id }) {
  const s = x.page.content.services;
  return html`<${Sec} x=${x} th=${th} id=${id} type="services" bg=${th.alt}>
    <${H2} x=${x} th=${th} path="services.title" sec=${id} />
    <${T} x=${x} sec=${id} path="services.sub" tag="p" style=${{ color: th.muted }} />
    <div class=${cx('mt-8 grid gap-4', !x.narrow && 'grid-cols-2')}>
      ${s.items.map((it, i) => {
        const own = x.pages.find((p) => p.kind === 'offer' && p.productId === it.id && p.status === 'live');
        return html`<div key=${it.id} class="flex flex-col" style=${{ background: th.card, borderRadius: `${th.radius}px`, padding: '26px', border: `1px solid ${th.line}`, borderTop: th.t.id === 'bold' ? `6px solid ${th.P}` : `1px solid ${th.line}` }}>
          <${T} x=${x} sec=${id} path=${`services.items.${i}.name`} tag="h3" class="mb-1.5" style=${{ fontFamily: th.head, fontWeight: 800, fontSize: '21px' }} />
          <${T} x=${x} sec=${id} path=${`services.items.${i}.desc`} tag="p" multiline class="mb-4 flex-1" style=${{ color: th.muted }} />
          <div class="flex items-center justify-between gap-3">
            <${T} x=${x} sec=${id} path=${`services.items.${i}.price`} tag="span" class="font-bold" style=${{ color: th.dark ? th.A : th.P, fontSize: '18px' }} />
            ${own && html`<span class="inline-flex items-center gap-1 text-[15px] font-bold" style=${{ color: th.dark ? '#fff' : th.P }}>לפרטים<${Icon} name="arrow-left" size=${15} /></span>`}
          </div>
        </div>`;
      })}
    </div>
  <//>`;
}

function Offer({ x, th, id }) {
  const o = x.page.content.offer;
  const fmt = new Intl.NumberFormat('he-IL').format(o.price);
  return html`<${Sec} x=${x} th=${th} id=${id} type="offer" bg=${th.alt}>
    <div class=${cx('grid gap-8', !x.narrow && 'grid-cols-[1.2fr_0.8fr] items-start')}>
      <div>
        <${H2} x=${x} th=${th} path="offer.title" sec=${id} />
        <ul class="mt-6 flex flex-col gap-3">
          ${o.includes.map(
            (_, i) => html`<li key=${i} class="flex items-start gap-3">
              <span class="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full" style=${{ background: th.P, color: th.onP }}><${Icon} name="check" size=${16} /></span>
              <${T} x=${x} sec=${id} path=${`offer.includes.${i}`} tag="span" class="font-semibold" style=${{ fontSize: x.narrow ? '17px' : '19px' }} />
            </li>`,
          )}
        </ul>
        ${o.bonus &&
        html`<div class="mt-6 flex items-center gap-3 p-4" style=${{ background: th.accentSoft, borderRadius: `${Math.max(th.radius - 4, 4)}px` }}>
          <${Icon} name="gift" size=${22} />
          <${T} x=${x} sec=${id} path="offer.bonus" tag="span" class="font-bold" />
        </div>`}
      </div>
      <div class="p-7" style=${{ background: th.card, borderRadius: `${th.radius}px`, border: `1.5px solid ${th.dark ? th.A : th.P}`, boxShadow: '0 24px 50px -32px rgba(0,0,0,.4)' }}>
        <p class="font-bold" style=${{ color: th.muted }}>${PRODUCTS.find((p) => p.id === x.page.productId)?.name}</p>
        <p class="my-2 leading-none" style=${{ fontFamily: th.head, fontWeight: 900, fontSize: '52px', color: th.ink }}>${fmt} <span style=${{ fontSize: '28px' }}>₪</span></p>
        <${T} x=${x} sec=${id} path="offer.terms" tag="p" class="mb-5" style=${{ color: th.muted }} />
        ${o.seats?.on && html`<p class="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[15px] font-bold" style=${{ background: th.accentSoft }}><${Icon} name="calendar-check" size=${16} />נשארו <${T} x=${x} sec=${id} path="offer.seats.n" /> מקומות ל<${T} x=${x} sec=${id} path="offer.seats.month" /></p>`}
        <div class="[&>span]:w-full"><${Btn} x=${x} th=${th} path="hero.cta" sec=${id} /></div>
        ${o.guarantee &&
        html`<p class="mt-5 flex items-start gap-2 text-[15px]" style=${{ color: th.muted }}>
          <${Icon} name="shield-check" size=${20} class="mt-0.5 shrink-0" />
          <${T} x=${x} sec=${id} path="offer.guarantee" tag="span" multiline />
        </p>`}
      </div>
    </div>
  <//>`;
}

function Process({ x, th, id }) {
  const p = x.page.content.process;
  return html`<${Sec} x=${x} th=${th} id=${id} type="process">
    <${H2} x=${x} th=${th} path="process.title" sec=${id} center />
    <ol class=${cx('mt-10 grid gap-4', !x.narrow && 'grid-cols-5')}>
      ${p.steps.map(
        (_, i) => html`<li key=${i} class=${cx('flex gap-3', !x.narrow && 'flex-col items-center text-center')}>
          <span class="grid h-11 w-11 shrink-0 place-items-center font-black" style=${{ fontFamily: th.head, border: `2px solid ${th.P}`, color: th.dark ? '#fff' : th.P, borderRadius: th.t.id === 'bold' ? '2px' : '999px' }}>${i + 1}</span>
          <${T} x=${x} sec=${id} path=${`process.steps.${i}`} tag="span" class="font-semibold" />
        </li>`,
      )}
    </ol>
  <//>`;
}

function About({ x, th, id }) {
  const a = x.page.content.about;
  return html`<${Sec} x=${x} th=${th} id=${id} type="about" bg=${th.t.hero === 'block' ? th.alt : th.bg}>
    <div class=${cx('grid items-center gap-10', !x.narrow && 'grid-cols-[0.75fr_1.25fr]')}>
      <${Photo} x=${x} th=${th} sec=${id} round=${th.t.id === 'personal' || th.t.id === 'soft'} style=${{ aspectRatio: '1 / 1', maxWidth: x.narrow ? '220px' : 'none' }} />
      <div>
        <${H2} x=${x} th=${th} path="about.title" sec=${id} />
        <${T} x=${x} sec=${id} path="about.text" tag="p" multiline class="mb-6" style=${{ color: th.muted, fontSize: x.narrow ? '17px' : '19px' }} />
        <div class="flex flex-wrap gap-2">
          ${a.creds.map(
            (_, i) => html`<span key=${i} class="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[15px] font-bold" style=${{ background: th.dark ? 'rgba(255,255,255,.08)' : th.tint, borderRadius: th.btnR === 999 ? '999px' : '8px' }}>
              <${Icon} name="check" size=${15} /><${T} x=${x} sec=${id} path=${`about.creds.${i}`} />
            </span>`,
          )}
        </div>
      </div>
    </div>
  <//>`;
}

function Testimonials({ x, th, id }) {
  const t = x.page.content.testimonials;
  return html`<${Sec} x=${x} th=${th} id=${id} type="testimonials" bg=${th.alt}>
    <${H2} x=${x} th=${th} path="testimonials.title" sec=${id} center />
    ${t.items.length === 0
      ? html`<div class="mx-auto mt-6 max-w-[620px] rounded-2xl border-2 border-dashed p-6 text-center" style=${{ borderColor: mix(th.P, '#ffffff', 0.5), fontFamily: 'Assistant', color: th.ink }}>
          <p class="mb-1 text-[17px] font-bold">כאן יופיעו המלצות אמיתיות מלקוחות</p>
          <p class="mb-4 text-[15px]" style=${{ color: th.muted }}>עד שתהיה המלצה, האזור לא מופיע בדף שבאוויר. לא ממציאים המלצות.</p>
          <button type="button" class="lp-add" onClick=${(e) => (e.stopPropagation(), x.onAddTestimonial?.())}><${Icon} name="plus" size=${16} />הוספת המלצה</button>
        </div>`
      : html`<div class=${cx('mt-8 grid gap-4', !x.narrow && 'grid-cols-2')}>
          ${t.items.map(
            (q, i) => html`<figure key=${i} class="p-6" style=${{ background: th.card, borderRadius: `${th.radius}px`, border: `1px solid ${th.line}` }}>
              <${Icon} name="quote" size=${26} />
              <${T} x=${x} sec=${id} path=${`testimonials.items.${i}.text`} tag="blockquote" multiline class="my-3 text-[18px]" />
              <figcaption class="font-bold" style=${{ color: th.muted }}><${T} x=${x} sec=${id} path=${`testimonials.items.${i}.who`} /></figcaption>
            </figure>`,
          )}
        </div>`}
  <//>`;
}

function Faq({ x, th, id }) {
  const f = x.page.content.faq;
  return html`<${Sec} x=${x} th=${th} id=${id} type="faq">
    <div class="mx-auto max-w-[760px]">
      <${H2} x=${x} th=${th} path="faq.title" sec=${id} center />
      <div class="mt-8">
        ${f.items.map(
          (_, i) => html`<details key=${i} open=${x.editable || i === 0} class="group py-4" style=${{ borderBottom: `1px solid ${th.line}` }}>
            <summary onClick=${(e) => x.editable && e.preventDefault()} class="flex cursor-pointer list-none items-center justify-between gap-3 font-bold" style=${{ fontSize: x.narrow ? '18px' : '20px', fontFamily: th.head }}>
              <${T} x=${x} sec=${id} path=${`faq.items.${i}.q`} />
              <${Icon} name="chevron-down" size=${20} class="transition-transform group-open:rotate-180" />
            </summary>
            <${T} x=${x} sec=${id} path=${`faq.items.${i}.a`} tag="p" multiline class="mt-2" style=${{ color: th.muted }} />
          </details>`,
        )}
      </div>
    </div>
  <//>`;
}

function Contact({ x, th, id }) {
  const [sent, setSent] = useState(false);
  const field = `h-12 w-full px-3.5 text-[16px] outline-none`;
  const fs = { background: th.dark ? 'rgba(255,255,255,.06)' : '#fff', border: `1.5px solid ${th.line}`, borderRadius: `${Math.min(th.radius, 12)}px`, color: th.ink, fontFamily: th.body };
  const solid = th.t.hero === 'block' || th.t.id === 'luxe';
  const photo = photoIn(x.page, 'contact');
  return html`<${Sec} x=${x} th=${th} id=${id} type="contact" bg=${solid ? (th.dark ? th.alt : th.P) : th.tint}>
    <div class=${cx('grid gap-8', !x.narrow && 'grid-cols-2 items-center')}>
      <div style=${{ color: photo ? '#fff' : solid && !th.dark ? th.onP : th.ink }}>
        <${T}
          x=${x}
          sec=${id}
          path="contact.title"
          tag="h2"
          class="mb-3 leading-tight"
          style=${{ fontFamily: th.head, fontWeight: 800, fontSize: x.narrow ? '30px' : '42px' }}
        />
        <${T} x=${x} sec=${id} path="contact.sub" tag="p" style=${{ opacity: 0.85 }} />
        <a class="mt-5 inline-flex h-12 items-center gap-2 rounded-full px-5 font-bold text-white" style=${{ background: '#1f9d55' }} onClick=${(e) => e.preventDefault()} href="#">
          <${Icon} name="message-circle" size=${19} /><${T} x=${x} sec=${id} path="contact.wa" />
        </a>
      </div>
      <form
        class="flex flex-col gap-3 p-6"
        style=${{ background: th.card, borderRadius: `${th.radius}px`, boxShadow: '0 24px 50px -30px rgba(0,0,0,.35)' }}
        onSubmit=${(e) => {
          e.preventDefault();
          if (!x.editable) setSent(true);
        }}
      >
        ${sent
          ? html`<div class="py-8 text-center">
              <span class="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full" style=${{ background: th.P, color: th.onP }}><${Icon} name="check" size=${28} /></span>
              <p class="text-[20px] font-bold">תודה! הפנייה נשלחה</p>
              <p style=${{ color: th.muted }}>${USER.firstName} יחזור אליכם בקרוב.</p>
            </div>`
          : html`<input class=${field} style=${fs} placeholder="שם מלא" aria-label="שם מלא" disabled=${x.editable} />
              <input class=${field} style=${fs} placeholder="טלפון" aria-label="טלפון" inputmode="tel" disabled=${x.editable} />
              <textarea class="w-full px-3.5 py-3 text-[16px] outline-none" rows="3" style=${fs} placeholder="במה אפשר לעזור? (לא חובה)" aria-label="הודעה" disabled=${x.editable}></textarea>
              ${x.editable
                ? html`<div class="w-full [&>span]:w-full"><${Btn} x=${x} th=${th} path="contact.cta" sec=${id} /></div>`
                : html`<button type="submit" class="w-full cursor-pointer [&>span]:w-full"><${Btn} x=${x} th=${th} path="contact.cta" sec=${id} /></button>`}
              <p class="text-center text-[13px]" style=${{ color: th.muted }}>הפרטים משמשים רק כדי לחזור אליכם.</p>`}
      </form>
    </div>
  <//>`;
}

function Footer({ x, th }) {
  return html`<footer style=${{ background: th.dark ? mix(th.P, '#000000', 0.88) : mix(th.P, '#0b0f0e', 0.82), color: 'rgba(255,255,255,.8)' }}>
    <div class="mx-auto flex flex-wrap items-center justify-between gap-3 text-[14px]" style=${{ maxWidth: '1080px', padding: x.narrow ? '22px 20px 90px' : '26px 48px' }}>
      <span class="flex items-center gap-2"><${LogoMark} P=${th.A} A="#ffffff" size=${26} /><b class="text-white">${USER.business}</b> · ${USER.fullName} · ${USER.phone}</span>
      <span style=${{ opacity: 0.6 }}>נבנה ב-FlowBiz</span>
    </div>
  </footer>`;
}

// On a phone the call to action stays at the bottom of the screen.
function StickyBar({ th, page }) {
  return html`<div class="sticky bottom-0 z-10 flex gap-2 p-3" style=${{ background: th.dark ? th.bg : '#ffffffee', backdropFilter: 'blur(6px)', borderTop: `1px solid ${th.line}` }}>
    <span data-cta class="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 font-bold" style=${{ background: th.btnBg, color: th.btnFg, borderRadius: th.btnR }}>${page.content.hero.cta}</span>
    <span class="grid h-12 w-12 place-items-center rounded-full text-white" style=${{ background: '#1f9d55' }} aria-label="וואטסאפ"><${Icon} name="message-circle" size=${22} /></span>
  </div>`;
}

const SECTIONS = { hero: Hero, pain: Pain, band: Band, method: Method, services: Services, offer: Offer, process: Process, about: About, testimonials: Testimonials, faq: Faq, contact: Contact };

// ---------- a live, scaled-down copy of a page (template cards, "הדפים שלי") ----------

export function Thumb({ page, width = 1180, height = 760, pages = [], narrow = false }) {
  const box = useRef();
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const fit = () => box.current && setScale(box.current.clientWidth / width);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box.current);
    return () => ro.disconnect();
  }, [width]);
  return html`<div ref=${box} class="relative w-full overflow-hidden" style=${{ height: `${height * scale}px` }} aria-hidden="true">
    ${scale > 0 &&
    html`<div class="pointer-events-none absolute right-0 top-0 origin-top-right" style=${{ width: `${width}px`, transform: `scale(${scale})` }}>
      <${PageView} page=${page} narrow=${narrow} pages=${pages} sticky=${false} />
    </div>`}
  </div>`;
}

// The link line shown above a page: lock, subdomain, path.
export function UrlLine({ slug, class: cls = '' }) {
  return html`<span class=${cx('inline-flex min-w-0 items-center gap-1.5', cls)} dir="ltr">
    <${Icon} name="lock" size=${13} class="shrink-0 text-money" />
    <span class="truncate">${pageUrl(slug)}</span>
  </span>`;
}
