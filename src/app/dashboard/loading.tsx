export default function DashboardLoading() {
  return (
    <div className="min-h-screen px-6 py-24 sm:px-8 animate-pulse">
      <div className="mx-auto max-w-[1000px]">
        <div className="h-10 w-64 rounded-lg bg-white/50" />
        <div className="mt-2 h-5 w-96 rounded bg-white/30" />
        <div className="mt-10 h-40 rounded-3xl bg-white/50" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/50" />
          ))}
        </div>
      </div>
    </div>
  )
}
