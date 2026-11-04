// Developer notes for task 3, plus a jump list of every screen (Shift+D).
import { html, Icon, cx } from './lib.js';
import { GENDER, SUBDOMAIN, ROOT_DOMAIN, setDemoGender } from './data.js';

export const JUMPS = [
  { id: 'opening', label: 'השלב: מסך פתיחה' },
  { id: 'data', label: 'חלק 1: מה נכנס לדף' },
  { id: 'template', label: 'חלק 2: בחירת עיצוב' },
  { id: 'wait', label: 'המתנה ל-AI' },
  { id: 'editor', label: 'חלק 3: העורך' },
  { id: 'done', label: 'חלק 4: הדף באוויר' },
  { id: 'pages', label: 'הדפים שלי' },
  { id: 'new', label: 'דף חדש להצעה' },
  { id: 'public', label: 'הדף כמו שהלקוחות רואים אותו' },
];

const NOTES = [
  {
    title: 'מה משתנה',
    items: [
      'השלב "דף נחיתה בקליק" (שלב 9, פרק "בניית מותג אישי") נשאר באותו מקום ומשודרג: 6 טמפלייטים מעוצבים במקום 3 סגנונות, עורך על הדף עצמו, תמונה של המשתמש, קישור קצר.',
      'הדף שנבנה בשלב הוא הדף הראשי של העסק. אחרי השלב, בעמוד חדש "הדפים שלי", יוצרים דף לכל הצעה מהסל.',
      'הצבעים תמיד מהלוגו ("שם ולוגו", שלב 6): צבע ראשי וצבע משני. הלוגו עצמו בראש הדף ובתחתית.',
    ],
  },
  {
    title: 'טמפלייטים',
    items: [
      'שישה: סטודיו, אישי, יוקרה, נועז, מינימלי, רך. כל טמפלייט קובע גופנים, פתיחה, סגנון אזורים, פינות וכפתורים. הצבעים והתוכן לא תלויים בטמפלייט.',
      'תמונת רקע: נוצרת ב-AI לפי תחום העסק (כמו היום, 16:9), ומוצגת באפור עם הצבע הראשי מעליה (multiply) ושכבה כהה מתחת לטקסט. כך כל תמונה בצבעי המותג והטקסט הלבן תמיד קריא. מופיעה ב"המסר המרכזי", ובנועז וביוקרה גם בפתיחה וביצירת קשר. אפשר להחליף, להעלות או להוריד (לשונית עיצוב, או "תמונת רקע" בכלי האזור).',
      'החלפת טמפלייט בעורך שומרת את כל הטקסטים, התמונה והסדר.',
      'טמפלייט מומלץ לפי סוג העסק (ליועצים: סטודיו). תצוגה מלאה לכל טמפלייט, במחשב ובמובייל, עם התוכן של המשתמש.',
    ],
  },
  {
    title: 'העורך',
    items: [
      'לחיצה על טקסט: עריכה במקום. Enter שומר (בטקסט ארוך Ctrl+Enter), Esc מבטל.',
      'לחיצה על אזור: הכלים שלו (למעלה, למטה, נוסח אחר מהכריש, הסתרה). "פתיחה" ו"יצירת קשר" קבועים.',
      'לחיצה על תמונה: העלאה, התמונה ששמורה בעסק, או בלי תמונה.',
      'גרירה: אזור נגרר בידית שעל השם שלו, או בשורה שלו בלשונית "אזורים". כרטיס בתוך אזור (כאב, שלב, שירות, פריט בהצעה, עובדה, המלצה, שאלה) נגרר בידית שבפינה שלו. מה שנגרר נוחת לפי הסדר של הטמפלייט, לא במיקום חופשי, כדי שהדף יישאר נקי ויעבוד במובייל. עובד גם במגע. Esc מבטל, Ctrl+Z מחזיר. החיצים נשארים, גם למקלדת.',
      'פאנל צד בארבע לשוניות: אזורים (סדר, הסתרה, הוספה), עיצוב (טמפלייט, צבעים, גופן, כפתורים, תמונה), הגדרות (שם, קישור, וואטסאפ, לידים, תצוגה בשיתוף), בדיקת מסר.',
      'ביטול וחזרה על פעולה, שמירה אוטומטית של כל שינוי, תצוגת מחשב ומובייל.',
      'בטלפון: הדף ברוחב מלא, והלשוניות נפתחות כחלון מלמטה.',
    ],
  },
  {
    title: 'מסרים',
    items: [
      'כותרת ראשית עד 8 מילים (היום: משפט של 25 מילים). קריאה לפעולה אחת שחוזרת בדף.',
      'כל טקסט מגיע מהנתונים של המשתמש, במילים שלו: "מכירים את זה?", "נעים להכיר" ו"המסר המרכזי" מדף המסרים; ההצעה, הבונוס, האחריות והשאלות הנפוצות (ההתנגדויות והתשובות) מ"בניית הצעה מנצחת"; השירותים והמחירים מסל המוצרים. המודל כותב בטון שנבחר בדף המסרים. בלשונית "אזורים" כתוב ליד כל אזור מאיפה הוא.',
      'אזור חדש "המסר המרכזי": הבעיה וההבטחה מדף המסרים, על תמונת הרקע, עם הקריאה לפעולה.',
      'בלי מספרים שהמשתמש לא נתן (לקוחות, תוצאות). מתחת לכפתור בפתיחה מופיעות העובדות מ"נעים להכיר".',
      'בדף שבאוויר כל כפתור קריאה לפעולה גולל לטופס יצירת הקשר.',
      'לשון הפנייה: לפי מה שהמשתמש סימן בהגדרות (זכר או נקבה). המודל כותב את הטקסטים בגוף ראשון בהתאם ("אני חוזר" / "אני חוזרת", "יועץ" / "יועצת"), וכך גם הודעת התודה בטופס ("דניאלה תחזור אליכם"). במוקאפ: דניאל ודניאלה, מעבר בראש הפאנל הזה.',
      'אין דחיפות מזויפת ואין ערך מנופח. "נשארו X מקומות" רק כשהמשתמש מדליק ומספר אמיתי.',
      'המלצות: רק אמיתיות. אזור בלי המלצה לא מופיע בדף שבאוויר.',
      'בדיקת מסר רצה על כל שינוי ולא חוסמת פרסום.',
    ],
  },
  {
    title: 'קישור ופניות',
    items: [
      `סאב-דומיין לכל משתמש: ${SUBDOMAIN}.${ROOT_DOMAIN} לדף הראשי, ‎/90-yom לדף הצעה. הקישור הישן (preview.flowbiz.co.il/l/<id>) מעביר לחדש.`,
      'כל פנייה מהטופס נכנסת ללידים, עם שם הדף כמקור. כפתור וואטסאפ פותח wa.me למספר מההגדרות.',
      'תצוגה בשיתוף (כותרת, תיאור, תמונה) לוואטסאפ, פייסבוק וגוגל.',
      'נשאר כמו היום: חיבור דומיין משלך (רשומות DNS), פיקסל Meta ו-Google Analytics, שדות הטופס, אימייל לפניות.',
    ],
  },
];

export function DevPanel({ open, onClose, onJump }) {
  return html`<aside
    class=${cx(
      'fixed inset-y-0 end-0 z-[70] flex w-full max-w-sm flex-col border-s border-slate-200 bg-white shadow-2xl transition-transform duration-300',
      open ? 'translate-x-0' : '-translate-x-full pointer-events-none invisible',
    )}
    aria-hidden=${!open}
  >
    <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
      <h2 class="flex items-center gap-2 text-[16px] font-bold text-slate-900"><${Icon} name="code-xml" size=${17} /> הערות למפתחים</h2>
      <button type="button" onClick=${onClose} aria-label="סגירה" class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer"><${Icon} name="x" size=${18} /></button>
    </div>
    <div class="thin-scroll flex-1 overflow-y-auto p-4 text-[14px] leading-relaxed text-slate-700">
      <section class="mb-4 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-3">
        <h3 class="mb-2 font-bold text-brand-900">המשתמש לדוגמה</h3>
        <div class="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="המשתמש לדוגמה">
          ${[
            ['m', 'דניאל', 'פנייה בלשון זכר'],
            ['f', 'דניאלה', 'פנייה בלשון נקבה'],
          ].map(
            ([id, name, sub]) => html`<button
              key=${id}
              type="button"
              role="radio"
              aria-checked=${GENDER === id}
              onClick=${() => GENDER !== id && setDemoGender(id)}
              class=${cx('rounded-lg border px-3 py-1.5 text-start cursor-pointer', GENDER === id ? 'border-brand-600 bg-brand-100 text-brand-900' : 'border-brand-200 bg-white text-brand-800 hover:bg-brand-100')}
            ><b class="block text-[14px]">${name}</b><small class="text-[12px]">${sub}</small></button>`,
          )}
        </div>
      </section>
      <section class="mb-5 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-3">
        <h3 class="mb-2 font-bold text-brand-900">מעבר מהיר בין המסכים</h3>
        <div class="flex flex-col gap-1.5">
          ${JUMPS.map(
            (j) => html`<button key=${j.id} type="button" onClick=${() => onJump(j.id)} class="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-start text-[13px] font-medium text-brand-800 hover:bg-brand-100 cursor-pointer">${j.label}</button>`,
          )}
        </div>
      </section>
      ${NOTES.map(
        (n) => html`<section key=${n.title} class="mb-4 p-1">
          <h3 class="mb-1.5 font-bold text-slate-900">${n.title}</h3>
          <ul class="list-disc space-y-1 ps-4">${n.items.map((t) => html`<li>${t}</li>`)}</ul>
        </section>`,
      )}
    </div>
  </aside>`;
}
