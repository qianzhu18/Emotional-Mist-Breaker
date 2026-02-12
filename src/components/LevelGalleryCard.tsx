import Image from "next/image";
import Link from "next/link";

import { getDifficultyLabel } from "@/lib/levels";
import type { LevelConfig } from "@/types/domain";

interface LevelGalleryCardProps {
  level: LevelConfig;
  unlocked: boolean;
  bestScore: number | null;
}

function difficultyDots(difficulty: LevelConfig["difficulty"]) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3].map((index) => (
        <span
          key={index}
          className={`h-2.5 w-2.5 rounded-full ${
            index <= difficulty ? "bg-yellow-300 shadow-[0_0_8px_rgba(250,204,21,0.7)]" : "bg-white/25"
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function cardBody(level: LevelConfig, bestScore: number | null, unlocked: boolean) {
  return (
    <>
      <div className="absolute inset-0 z-0">
        <Image
          src={level.visual.artwork.scene}
          alt={`${level.title} 场景`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority={level.id <= 2}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/15" />
        <div
          className="absolute inset-0 opacity-30 mix-blend-screen transition-opacity duration-500 group-hover:opacity-60"
          style={{ backgroundColor: level.visual.palette.primary }}
          aria-hidden="true"
        />
      </div>

      <div className="absolute bottom-0 right-[-10%] z-10 h-[88%] w-[86%] transition-transform duration-500 group-hover:translate-x-[-2%] group-hover:scale-[1.04]">
        <Image
          src={level.visual.artwork.portrait}
          alt={`${level.opponent_ai.name} 立绘`}
          fill
          sizes="(max-width: 768px) 90vw, 28vw"
          className="object-contain object-bottom drop-shadow-[0_12px_36px_rgba(0,0,0,0.55)]"
        />
      </div>

      <div className="absolute inset-0 z-20 flex flex-col justify-between p-5 text-white md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
              {level.visual.chapter}
            </p>
            <span
              className="inline-flex items-center rounded-full border bg-white/10 px-3 py-1 text-[11px] font-semibold backdrop-blur-md"
              style={{ borderColor: level.visual.palette.primary }}
            >
              {level.visual.theme_name}
            </span>
          </div>
          <div className="space-y-2 text-right">
            {difficultyDots(level.difficulty)}
            <p className="text-[11px] font-medium text-white/70">{getDifficultyLabel(level.difficulty)}</p>
          </div>
        </div>

        <div className="max-w-[72%] space-y-2 transition-transform duration-300 group-hover:-translate-y-1">
          <p
            className="text-4xl font-black italic leading-none tracking-tight"
            style={{ textShadow: `0 8px 22px ${level.visual.palette.primary}` }}
          >
            {level.opponent_ai.name}
          </p>
          <h3 className="text-lg font-bold leading-snug text-white/95">{level.title}</h3>
          <p
            className={`text-sm leading-relaxed text-white/75 transition-opacity duration-300 ${
              unlocked ? "opacity-0 group-hover:opacity-100" : "opacity-95"
            }`}
          >
            {level.description}
          </p>
          <div
            className={`flex flex-wrap gap-2 text-[10px] transition-opacity duration-300 ${
              unlocked ? "opacity-0 group-hover:opacity-100" : "opacity-95"
            }`}
          >
            <span className="rounded-md border border-white/35 bg-black/35 px-2 py-1 uppercase tracking-[0.08em]">
              {level.fog_type}
            </span>
            {level.learning_focus[0] ? (
              <span className="rounded-md border border-white/25 bg-white/10 px-2 py-1">{level.learning_focus[0]}</span>
            ) : null}
          </div>
          {bestScore !== null ? (
            <p className="text-sm font-semibold" style={{ color: level.visual.palette.tertiary }}>
              最高分 {bestScore}
            </p>
          ) : null}
        </div>
      </div>

      {!unlocked ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 backdrop-blur-[2px]">
          <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
            关卡未解锁
          </span>
        </div>
      ) : null}
    </>
  );
}

export function LevelGalleryCard({ level, unlocked, bestScore }: LevelGalleryCardProps) {
  const baseClass =
    "group relative block h-[420px] overflow-hidden rounded-[30px] border border-white/20 bg-[#080c17] shadow-[0_20px_60px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

  if (!unlocked) {
    return (
      <article
        className={`${baseClass} cursor-not-allowed grayscale-[0.18]`}
        aria-label={`${level.title}，关卡未解锁`}
      >
        {cardBody(level, bestScore, unlocked)}
      </article>
    );
  }

  return (
    <Link href={`/battle/${level.id}`} className={`${baseClass} cursor-pointer transition-transform duration-300 hover:-translate-y-1.5`}>
      {cardBody(level, bestScore, unlocked)}
    </Link>
  );
}
