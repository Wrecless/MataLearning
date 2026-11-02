"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="panel p-6 md:p-10">
      <h1 className="font-display text-3xl font-bold">
        This game could not load
      </h1>
      <p className="mt-4 text-muted">
        Try again. Your saved completion progress will stay in this browser.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="icon-button" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="icon-button">
          Back to the hub
        </Link>
      </div>
    </section>
  );
}
