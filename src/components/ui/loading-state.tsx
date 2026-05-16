type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Loading" }: LoadingStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-weldoo-muted">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-weldoo-border border-t-weldoo-indigo" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
