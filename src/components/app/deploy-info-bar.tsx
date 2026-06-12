function formatDeployTime(value: string) {
  if (!value) {
    return "local development";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "unknown";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(date);
}

export function DeployInfoBar() {
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME ?? "";
  const environment = process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development";
  const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "";
  const shortSha = commitSha ? commitSha.slice(0, 7) : null;
  const deployTime = formatDeployTime(buildTime);

  return (
    <div className="h-7 border-b border-weldoo-border-light bg-weldoo-indigo text-white">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-3 px-5 text-[11.5px] font-semibold tracking-[0.01em] sm:px-8">
        <span className="truncate">Last deploy: {deployTime}</span>
        <span className="hidden shrink-0 items-center gap-2 text-white/80 sm:flex">
          {environment ? <span>{environment}</span> : null}
          {shortSha ? <span>{shortSha}</span> : null}
        </span>
      </div>
    </div>
  );
}
