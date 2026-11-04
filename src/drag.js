// Dragging in the editor: a section by its name chip or its row in the panel, a card by
// the handle in its corner. Pointer events, so a finger works too. What is dragged lands
// in the order of the template, never at a free position. Esc cancels.

const START_AFTER = 6;
const EDGE = 70;

const distance = (r, x, y) => Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));

function scrollerOf(el) {
  for (let p = el.parentElement; p; p = p.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(p).overflowY) && p.scrollHeight > p.clientHeight) return p;
  }
  return null;
}

export function startDrag(e, { items, from, label, onDrop, onTap }) {
  if (e.button > 0) return;
  e.preventDefault();
  e.stopPropagation();
  const scroller = scrollerOf(items[from]);
  const start = { x: e.clientX, y: e.clientY };
  let at = start;
  let on = false;
  let to = from;
  let ghost = null;

  const mark = () =>
    items.forEach((el, i) => {
      el.classList.toggle('is-dragging', on && i === from);
      el.classList.toggle('drop-before', on && i === to && to < from);
      el.classList.toggle('drop-after', on && i === to && to > from);
    });
  const aim = () => {
    const d = items.map((el) => distance(el.getBoundingClientRect(), at.x, at.y));
    to = d.indexOf(Math.min(...d));
    mark();
  };
  const begin = () => {
    on = true;
    if (document.activeElement?.isContentEditable) document.activeElement.blur();
    document.body.classList.add('lp-dragging');
    ghost = document.createElement('div');
    ghost.className = 'lp-ghost';
    ghost.textContent = label;
    document.body.append(ghost);
    requestAnimationFrame(autoScroll);
  };
  const autoScroll = () => {
    if (!on) return;
    if (scroller) {
      const r = scroller.getBoundingClientRect();
      const near = at.y < r.top + EDGE ? at.y - r.top - EDGE : at.y > r.bottom - EDGE ? at.y - r.bottom + EDGE : 0;
      if (near) {
        scroller.scrollTop += Math.max(-18, Math.min(18, near / 3));
        aim();
      }
    }
    requestAnimationFrame(autoScroll);
  };
  const move = (ev) => {
    at = { x: ev.clientX, y: ev.clientY };
    if (!on) {
      if (Math.hypot(at.x - start.x, at.y - start.y) < START_AFTER) return;
      begin();
    }
    ghost.style.transform = `translate(${at.x + 14}px, ${at.y + 14}px)`;
    aim();
  };
  const finish = (drop) => {
    const dragged = on;
    on = false;
    mark();
    ghost?.remove();
    document.body.classList.remove('lp-dragging');
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', cancel);
    window.removeEventListener('keydown', key);
    if (!dragged) return drop && onTap?.();
    if (drop && to !== from) onDrop(from, to);
  };
  const up = () => finish(true);
  const cancel = () => finish(false);
  const key = (ev) => ev.key === 'Escape' && finish(false);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', cancel);
  window.addEventListener('keydown', key);
}
