import { SeloraIcon } from '@/components/brand/SeloraLogo';

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="size-16 rounded-2xl bg-card border border-border shadow-xl shadow-[#252175]/10 flex items-center justify-center">
            <SeloraIcon size={34} className="animate-pulse" />
          </div>
          <div className="absolute -inset-1.5 rounded-[22px] border-2 border-[#f37021]/30 border-t-[#f37021] animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs font-bold tracking-tight text-foreground">
            Selora<span className="text-[#f37021]">X</span> EMS
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">
            Loading workspace...
          </span>
        </div>
      </div>
    </div>
  );
}
