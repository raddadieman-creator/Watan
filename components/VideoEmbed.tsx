"use client";

import { useState } from "react";

/**
 * فيديو يوتيوب خفيف: صورة مصغرة وزر تشغيل، ولا يُحمَّل المشغّل إلا عند الضغط.
 * يُستخدم نطاق youtube-nocookie لتقليل التتبع.
 */
export function VideoEmbed({ id, title, channel }: { id: string; title: string; channel?: string }) {
  const [play, setPlay] = useState(false);
  return (
    <figure className="overflow-hidden rounded-xl bg-ink/5">
      <div className="relative aspect-video w-full">
        {play ? (
          <iframe
            className="absolute inset-0 size-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&hl=ar`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlay(true)}
            className="group absolute inset-0 flex items-center justify-center"
            aria-label={`تشغيل فيديو: ${title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" aria-hidden />
            <span className="relative flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-coral to-sun text-white shadow-[0_10px_30px_-6px_rgba(229,83,75,0.9)] transition group-hover:scale-110" aria-hidden>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="translate-x-[-2px] rotate-180"><path d="M7 5v14l11-7z" /></svg>
            </span>
            <span className="absolute bottom-2 start-3 text-xs font-bold text-white drop-shadow">شاهد الفيديو</span>
          </button>
        )}
      </div>
      {channel && <figcaption className="px-3 py-1.5 text-[0.7rem] text-ink-muted">المصدر: {channel} — يوتيوب</figcaption>}
    </figure>
  );
}
