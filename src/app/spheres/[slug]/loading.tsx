export default function SphereLoading() {
  return (
    <div className="min-h-screen px-6 py-24 sm:px-8 animate-pulse">
      <div className="mx-auto max-w-[1000px]">
        <div className="h-20 w-20 rounded-2xl bg-white/50" />
        <div className="mt-6 h-10 w-48 rounded-lg bg-white/50" />
        <div className="mt-2 h-6 w-full max-w-md rounded bg-white/30" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/50" />
          ))}
        </div>
      </div>
    </div>
  )
}
