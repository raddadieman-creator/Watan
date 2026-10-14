import { NextResponse } from "next/server";

/**
 * عدّاد الزوار: يحفظ رقمًا واحدًا في Upstash Redis عبر واجهة REST (بلا مكتبات إضافية).
 * يعمل حين تُضاف قاعدة Upstash Redis إلى المشروع من Vercel (Storage)، فتُضاف متغيراتها تلقائيًا.
 * لا يخزن أي بيانات شخصية: رقم إجمالي فقط.
 */
export const dynamic = "force-dynamic";

const KEY = "watan:visits";

function creds() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function redis(cmd: string[]) {
  const c = creds();
  if (!c) return null;
  const res = await fetch(`${c.url}/${cmd.map(encodeURIComponent).join("/")}`, {
    headers: { Authorization: `Bearer ${c.token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  const json = (await res.json()) as { result: string | number | null };
  return Number(json.result ?? 0);
}

export async function GET() {
  try {
    const count = await redis(["get", KEY]);
    return NextResponse.json({ enabled: count !== null, count: count ?? 0 });
  } catch {
    return NextResponse.json({ enabled: false, count: 0 }, { status: 200 });
  }
}

export async function POST() {
  try {
    const count = await redis(["incr", KEY]);
    return NextResponse.json({ enabled: count !== null, count: count ?? 0 });
  } catch {
    return NextResponse.json({ enabled: false, count: 0 }, { status: 200 });
  }
}
