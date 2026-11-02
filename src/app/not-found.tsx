import Link from "next/link";

export default function NotFound() {
  return (
    <section className="panel p-6 md:p-10">
      <h1 className="font-display text-3xl font-bold">Game not found</h1>
      <p className="mt-4 text-muted">
        That address does not match a game. Choose a game from the menu or
        return to the hub.
      </p>
      <Link href="/" className="icon-button mt-6">
        Back to the hub
      </Link>
    </section>
  );
}
