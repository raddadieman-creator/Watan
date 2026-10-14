import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { PROJECT_CREDIT } from "@/lib/site";

export const metadata: Metadata = { title: "عن وطن", description: "فكرة منصة وطن وأهدافها وما أُنجز منها وما يجري العمل عليه." };

const BUILT = [
  ["أطلس تفاعلي للمناطق الثلاث عشرة", "تمرير ولمس ونقر ولوحة مفاتيح، مع طبقات للسكان ومقار الإمارات وأسماء المناطق"],
  ["صفحة لكل منطقة", "بيانات موثقة لكل المناطق، ومحتوى مفصل للرياض والمدينة المنورة وعسير"],
  ["التراث في قوائم اليونسكو", "8 مواقع تراث عالمي و18 عنصر تراث غير مادي، بروابطها الرسمية"],
  ["المملكة بالأرقام", "مقارنة المناطق في السكان والمساحة والكثافة"],
  ["بحث موحد", "يتسامح مع اختلاف الهمزات والتاء المربوطة و«ال» التعريف"],
];

const NEXT = [
  "حكاية وطن: خط زمني من الدولة السعودية الأولى إلى اليوم، بتواريخ هجرية وميلادية موثقة",
  "دولتنا: نظام الحكم والتقسيم الإداري والرموز الوطنية",
  "أرض تتنوع: الجبال والرمال والسواحل والمحميات، مع المتوسطات المناخية الرسمية",
  "ذاكرة وطن: الفنون الشعبية والأزياء والحرف، مع التمييز بين المحلي والوطني والمسجل دوليًا",
  "المعرفة تصنع المستقبل: خريطة الجامعات من قوائم وزارة التعليم",
  "وطن يتقدم: قصة التحول الرقمي من تقارير هيئة الحكومة الرقمية",
  "رؤية تتحقق: محاور الرؤية وبرامجها ومؤشراتها، مع التمييز بين المنجز والجاري والمخطط",
  "مختبر وطن: تحدي المناطق، وأين يقع؟، ورحلة عبر الزمن، وجواز المستكشف",
  "دليل: مساعد معرفي يجيب من محتوى المنصة الموثق ويذكر مصادره",
  "لوحة إدارة بصلاحيات المشرف والمحرر والمراجع، وسجل للتعديلات",
  "النسخة الإنجليزية، ووضع العرض «رحلة في وطن»",
];

export default function AboutPage() {
  return (
    <>
    <PageHero kicker="المنصة" title="عن وطن" lead="المملكة كما لم تكتشفها من قبل — 13 منطقة، وطن واحد." />
    <div className="mx-auto max-w-4xl px-5 sm:px-8">
      <div className="mt-10 grid gap-4 text-[1.05rem] leading-9 text-charcoal/90">
        <p>
          «وطن» منصة معرفية تفاعلية عن المملكة العربية السعودية، تجعل الخريطة مدخلًا إلى المعرفة: يختار الزائر منطقة، فيصل منها إلى سكانها ومحافظاتها وتراثها وجامعاتها، ويقارنها بغيرها.
        </p>
        <p>
          تُعرض المعلومة فيها بمصدرها، وما لم يُتحقق منه بعد يظهر موسومًا بأنه بحاجة للتحقق بدل أن يُملأ بتقدير.
        </p>
        <p>
          تخدم المنصة طلاب التعليم العام والجامعي ومعلميهم، والمهتمين بالجغرافيا والتراث، وزوار المملكة. ويمكن توظيفها في دروس الجغرافيا والدراسات الاجتماعية، وفي أنشطة التعلم القائم على الاستكشاف.
        </p>
      </div>

      <section className="museum mt-12 p-7" aria-labelledby="team-h">
        <h2 id="team-h" className="font-display text-[1.9rem] text-ink">تقديم المشروع</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-ink-muted">مقدِّمة المشروع</dt>
            <dd className="mt-1 font-display text-2xl leading-10 text-ink">{PROJECT_CREDIT.presenter}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-muted">المدرسة</dt>
            <dd className="mt-1 font-display text-2xl leading-10 text-ink">{PROJECT_CREDIT.school}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-14" aria-labelledby="built-h">
        <h2 id="built-h" className="font-display text-[2.2rem] text-ink">ما يعمل الآن</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {BUILT.map(([t, d]) => (
            <li key={t} className="grid gap-1 py-4 sm:grid-cols-[16rem_1fr] sm:gap-6">
              <span className="font-display font-medium">{t}</span>
              <span className="text-ink-muted">{d}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14" aria-labelledby="next-h">
        <h2 id="next-h" className="font-display text-[2.2rem] text-ink">قيد البناء</h2>
        <p className="mt-2 text-sm text-ink-muted">هذه أقسام مخطط لها، وليست روابط بعد. لن يظهر أي قسم في القائمة الرئيسية قبل أن يعمل فعلًا.</p>
        <ol className="mt-4 grid gap-2">
          {NEXT.map((n, i) => (
            <li key={n} className="grid grid-cols-[2rem_1fr] gap-2 text-[0.98rem] leading-8">
              <span className="num font-display text-sun-deep">{i + 1}</span>
              <span>{n}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-14 text-sm text-ink-muted">
        للاطلاع على المراجع: <Link href="/sources" className="text-emerald underline underline-offset-4">المصادر والمراجع</Link>.
      </p>
    </div>
    </>
  );
}
