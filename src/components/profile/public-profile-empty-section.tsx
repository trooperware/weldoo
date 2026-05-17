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
    <section className="mt-6 border-t border-[var(--weldoo-border-light)] pt-5">
      <EmptyState description={description} title={title} />
    </section>
  );
}
