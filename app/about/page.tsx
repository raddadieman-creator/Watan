import type { Metadata } from "next";
import Link from "next/link";

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
    <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6">
      <h1 className="font-display text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold text-green-deep">عن وطن</h1>
      <div className="mt-5 grid gap-4 text-[1.05rem] leading-9 text-charcoal/90">
        <p>
          «وطن» منصة معرفية تفاعلية عن المملكة العربية السعودية، تجعل الخريطة مدخلًا إلى المعرفة: يختار الزائر منطقة، فيصل منها إلى سكانها ومحافظاتها وتراثها وجامعاتها، ويقارنها بغيرها.
        </p>
        <p>
          المنصة مشروع مستقل، لا يتبع جهة حكومية ولا مدرسة ولا مؤسسة تعليمية، ولا يحمل أي اعتماد رسمي. تُعرض المعلومة فيها بمصدرها، وما لم يُتحقق منه بعد يظهر موسومًا بأنه بحاجة للتحقق بدل أن يُملأ بتقدير.
        </p>
        <p>
          تخدم المنصة طلاب التعليم العام والجامعي ومعلميهم، والمهتمين بالجغرافيا والتراث، وزوار المملكة. ويمكن توظيفها في دروس الجغرافيا والدراسات الاجتماعية، وفي أنشطة التعلم القائم على الاستكشاف.
        </p>
      </div>

      <section className="mt-14" aria-labelledby="built-h">
        <h2 id="built-h" className="font-display text-2xl font-bold text-green-deep">ما يعمل الآن</h2>
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
        <h2 id="next-h" className="font-display text-2xl font-bold text-green-deep">قيد البناء</h2>
        <p className="mt-2 text-sm text-ink-muted">هذه أقسام مخطط لها، وليست روابط بعد. لن يظهر أي قسم في القائمة الرئيسية قبل أن يعمل فعلًا.</p>
        <ol className="mt-4 grid gap-2">
          {NEXT.map((n, i) => (
            <li key={n} className="grid grid-cols-[2rem_1fr] gap-2 text-[0.98rem] leading-8">
              <span className="num font-display text-sand">{i + 1}</span>
              <span>{n}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-14 text-sm text-ink-muted">
        للاطلاع على المراجع: <Link href="/sources" className="text-emerald underline underline-offset-4">المصادر والمراجع</Link>.
      </p>
    </div>
  );
}
