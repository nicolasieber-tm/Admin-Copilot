// Skeleton während des Ladens (Motion E): schimmernde Platzhalter in
// Karten-Optik statt weisser Fläche. Gilt für alle Tabs ohne eigenes Skeleton.
export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="skel h-8 w-36" />
      <div className="card-elevated rounded-2xl bg-surface p-4">
        <div className="skel h-4 w-2/5" />
        <div className="mt-4 flex flex-col gap-2.5">
          <div className="skel h-3.5 w-4/5" />
          <div className="skel h-3.5 w-3/5" />
          <div className="skel h-3.5 w-2/3" />
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
  );
}
