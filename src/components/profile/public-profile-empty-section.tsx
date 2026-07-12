import { EmptyState } from "@/components/ui";

type PublicProfileEmptySectionProps = {
  description: string;
  title: string;
};

export function PublicProfileEmptySection({
  description,
  title,
}: PublicProfileEmptySectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--weldoo-border)] bg-white p-5 shadow-weldoo-sm sm:p-6">
      <EmptyState description={description} title={title} />
    </section>
  );
}
