import Image from "next/image";
import { about } from "../data/about";
import { profile, socials } from "../data/profile";
import PageHeader from "./PageHeader";

export default function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title="About" onBack={onBack} />

      <div className="mx-auto w-full max-w-245 px-5 py-10 md:px-10 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-4">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-background-200 md:max-w-70">
              <Image
                src={about.portraitUrl}
                alt={`Portrait of ${profile.name}`}
                fill
                sizes="280px"
                className="object-cover object-top"
              />
            </div>
            <div className="mt-5 space-y-1">
              <p className="text-[14px] font-medium text-foreground-950">{profile.name}</p>
              <p className="text-[13px] text-foreground-400">{profile.role}</p>
              <p className="text-[13px] text-foreground-400">{about.location}</p>
            </div>
          </div>

          <div className="md:col-span-8">
            <h2 className="text-[30px] leading-tight tracking-tight text-foreground-950 md:text-[42px]">
              {about.headline}
              <span className="text-foreground-400">{about.headlineMuted}</span>
            </h2>
            <div className="mt-7 space-y-4">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-[14.5px] leading-[1.8] text-foreground-700">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target={social.url.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-background-200 text-foreground-700 transition-colors hover:border-foreground-950 hover:bg-foreground-950 hover:text-background-50"
                >
                  <i className={`${social.iconClass} text-[16px]`} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 border-t border-background-200 pt-10 md:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-foreground-400">What I do</p>
            <ul className="mt-4 space-y-2.5">
              {about.skills.map((skill) => (
                <li key={skill} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-foreground-700">
                  <span className="mt-2 h-1.25 w-1.25 shrink-0 rounded-full bg-foreground-950" />
                  {skill}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-foreground-400">How I work</p>
            <ol className="mt-4 space-y-4">
              {about.steps.map((step, index) => (
                <li key={step.title} className="flex gap-3.5">
                  <span className="pt-0.75 text-[10px] uppercase tracking-widest text-foreground-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-[14px] font-medium text-foreground-950">{step.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-foreground-400">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* <div className="mt-10 grid grid-cols-1 gap-6 rounded-lg bg-background-100 px-6 py-7 sm:grid-cols-3 md:px-8">
          {about.stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl leading-none tracking-tight text-foreground-950">{stat.value}</p>
              <p className="mt-2 text-[10px] uppercase tracking-widest text-foreground-400">{stat.label}</p>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}
