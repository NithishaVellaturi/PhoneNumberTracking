export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-300">{eyebrow}</span>
      <h2 className="text-3xl font-semibold text-white md:text-4xl">{title}</h2>
      <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{description}</p>
    </div>
  )
}
