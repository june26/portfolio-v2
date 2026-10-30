import BackButton from "./BackButton";

type PageHeaderProps = {
  title: string;
  onBack: () => void;
};

export default function PageHeader({ title, onBack }: PageHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-background-200 px-5 md:h-18 md:px-10">
      <BackButton onClick={onBack} />
      <p className="text-[10px] uppercase tracking-widest text-foreground-400">{title}</p>
    </header>
  );
}
