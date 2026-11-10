"use client";

export function AtmosphericBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-cemetery-void"
    >
      {/* Moonlight radial glow */}
      <div className="absolute -top-40 right-[8%] h-[420px] w-[420px] rounded-full bg-sky-400/10 blur-[120px]" />
      <div className="absolute top-[20%] -left-32 h-[380px] w-[380px] rounded-full bg-purple-600/12 blur-[130px]" />
      <div className="absolute bottom-[-120px] left-1/3 h-[360px] w-[480px] rounded-full bg-emerald-500/8 blur-[140px]" />

      {/* Crescent Moon */}
      <div className="absolute right-10 top-20 hidden opacity-30 md:block">
        <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-sky-100 to-sky-300/60 shadow-[0_0_50px_rgba(125,211,252,0.28)]">
          <div className="absolute -right-2 -top-1 h-16 w-16 rounded-full bg-cemetery-void" />
        </div>
      </div>

      {/* Drifting fog layers */}
      <div className="animate-drift absolute inset-x-[-15%] top-[18%] h-56 rounded-[100%] bg-gradient-to-r from-transparent via-purple-900/10 to-transparent blur-3xl" />
      <div className="animate-drift-reverse absolute inset-x-[-10%] bottom-[8%] h-64 rounded-[100%] bg-gradient-to-r from-transparent via-emerald-950/20 to-transparent blur-3xl" />

      {/* Subtle fireflies / spectral wisps */}
      <span className="animate-wisp absolute left-[14%] top-[28%] h-1.5 w-1.5 rounded-full bg-emerald-300/60 shadow-[0_0_12px_#4ade80]" />
      <span
        className="animate-wisp absolute left-[78%] top-[36%] h-1.5 w-1.5 rounded-full bg-purple-300/60 shadow-[0_0_12px_#c084fc]"
        style={{ animationDelay: "1.4s" }}
      />
      <span
        className="animate-wisp absolute left-[32%] top-[68%] h-1 w-1 rounded-full bg-sky-300/60 shadow-[0_0_10px_#7dd3fc]"
        style={{ animationDelay: "2.3s" }}
      />
      <span
        className="animate-wisp absolute left-[64%] top-[76%] h-1.5 w-1.5 rounded-full bg-emerald-300/50 shadow-[0_0_10px_#4ade80]"
        style={{ animationDelay: "3.1s" }}
      />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.45) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}

