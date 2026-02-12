"use client";

import { motion, useReducedMotion } from "framer-motion";

interface MistBackgroundProps {
  intensity?: "normal" | "storm";
}

const PARTICLES = [
  { left: "6%", top: "12%", size: 220, driftX: 20, driftY: -120, duration: 30, delay: 0 },
  { left: "76%", top: "18%", size: 300, driftX: -18, driftY: -160, duration: 36, delay: 2 },
  { left: "22%", top: "62%", size: 190, driftX: 16, driftY: -110, duration: 28, delay: 1 },
  { left: "64%", top: "70%", size: 260, driftX: -20, driftY: -140, duration: 42, delay: 5 },
  { left: "45%", top: "38%", size: 140, driftX: 14, driftY: -96, duration: 24, delay: 3 },
  { left: "88%", top: "56%", size: 210, driftX: -22, driftY: -124, duration: 34, delay: 4 },
];

export function MistBackground({ intensity = "normal" }: MistBackgroundProps) {
  const reduceMotion = useReducedMotion();
  const fogOpacity = intensity === "storm" ? 0.34 : 0.24;
  const glowOpacity = intensity === "storm" ? 0.5 : 0.36;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#030712]" aria-hidden="true">
      <div className="absolute -left-[16%] top-[-26%] h-[74vh] w-[74vh] rounded-full bg-cyan-500/20 blur-[130px]" />
      <div className="absolute right-[-20%] top-[8%] h-[72vh] w-[72vh] rounded-full bg-indigo-500/20 blur-[140px]" />
      <div className="absolute bottom-[-30%] left-[28%] h-[82vh] w-[82vh] rounded-full bg-blue-600/15 blur-[170px]" />

      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? { opacity: fogOpacity } : { opacity: fogOpacity }}
        transition={reduceMotion ? undefined : { duration: 1.8 }}
        style={{
          background:
            "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.13), transparent 36%), radial-gradient(circle at 80% 76%, rgba(148,163,184,0.12), transparent 28%), radial-gradient(circle at 48% 58%, rgba(148,163,184,0.12), transparent 48%)",
        }}
      />

      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { backgroundPosition: "0% 0%" }}
        animate={reduceMotion ? undefined : { backgroundPosition: ["0% 0%", "24% 18%", "0% 0%"] }}
        transition={
          reduceMotion
            ? undefined
            : {
                duration: 26,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }
        }
        style={{
          opacity: glowOpacity,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.16) 1px, transparent 0), radial-gradient(circle at 1px 1px, rgba(56,189,248,0.14) 1px, transparent 0)",
          backgroundSize: "26px 26px, 34px 34px",
        }}
      />

      <div className="absolute inset-0">
        {PARTICLES.map((particle) => (
          <motion.span
            key={`${particle.left}-${particle.top}-${particle.size}`}
            className="absolute rounded-full bg-white/9 blur-xl"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
            }}
            initial={reduceMotion ? false : { x: 0, y: 0, opacity: 0.2 }}
            animate={
              reduceMotion
                ? { opacity: 0.2 }
                : {
                    x: [0, particle.driftX, 0],
                    y: [0, particle.driftY, 0],
                    opacity: [0.12, 0.24, 0.12],
                  }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: particle.duration,
                    delay: particle.delay,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }
            }
          />
        ))}
      </div>
    </div>
  );
}
