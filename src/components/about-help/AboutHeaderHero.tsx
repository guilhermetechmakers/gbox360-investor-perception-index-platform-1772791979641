import { cn } from "@/lib/utils"

interface AboutHeaderHeroProps {
  title: string
  subtitle: string
  backgroundPattern?: string
  className?: string
}

export function AboutHeaderHero({
  title,
  subtitle,
  backgroundPattern,
  className,
}: AboutHeaderHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-[rgb(var(--hero-bg))] px-4 py-16 md:py-24",
        backgroundPattern && "bg-cover bg-center",
        className
      )}
      style={
        backgroundPattern
          ? { backgroundImage: `url(${backgroundPattern})` }
          : undefined
      }
    >
      <div className="container mx-auto max-w-[1000px] text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-[rgb(var(--foreground))] md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-[rgb(var(--muted-foreground))]">
          {subtitle}
        </p>
      </div>
    </section>
  )
}
