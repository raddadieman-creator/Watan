import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="num font-display text-6xl font-extrabold text-sand">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-green-deep">هذه الصفحة غير موجودة</h1>
      <p className="mt-3 text-ink-muted">ربما تغيّر الرابط. ابدأ من الخريطة أو ابحث عن ما تريد.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="inline-flex h-11 items-center rounded-full bg-green-deep px-5 text-ivory hover:bg-emerald">العودة إلى الخريطة</Link>
        <Link href="/search" className="inline-flex h-11 items-center rounded-full border border-line px-5 hover:border-sand">البحث</Link>
      </div>
    </div>
  );
}
