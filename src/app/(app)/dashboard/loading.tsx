// Skeleton des Start-Tabs (Motion E): dunkler Kopf + Karten-Platzhalter,
// damit beim Laden nichts springt und der Tab sofort «da» wirkt.
export default function Loading() {
  return (
    <div>
      <div
        className="hero-gradient -mx-4 -mt-6 px-5 pb-14"
        style={{ paddingTop: "calc(1.5rem + env(safe-area-inset-top))" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="skel skel-inv h-6 w-36" />
            <div className="skel skel-inv mt-2 h-3 w-28" />
          </div>
          <div className="skel skel-inv h-10 w-10 rounded-full" />
        </div>
        <div className="skel skel-inv mt-7 h-3 w-32" />
        <div className="skel skel-inv mt-2 h-10 w-56" />
        <div className="mt-4 flex gap-2.5">
          <div className="skel skel-inv h-14 flex-1 rounded-2xl" />
          <div className="skel skel-inv h-14 flex-1 rounded-2xl" />
          <div className="skel skel-inv h-14 flex-1 rounded-2xl" />
        </div>
      </div>
      <div className="relative -mx-4 -mt-7 rounded-t-[28px] bg-background px-4 pt-5">
        <div className="flex flex-col gap-5">
          <div className="card-elevated rounded-2xl bg-surface p-4">
            <div className="skel h-4 w-2/5" />
            <div className="mt-4 flex flex-col gap-2.5">
              <div className="skel h-3.5 w-4/5" />
              <div className="skel h-3.5 w-3/5" />
            </div>
          </div>
          <div className="card-elevated rounded-2xl bg-surface p-4">
            <div className="skel h-4 w-1/3" />
            <div className="mt-4 flex flex-col gap-2.5">
              <div className="skel h-3.5 w-3/4" />
              <div className="skel h-3.5 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
