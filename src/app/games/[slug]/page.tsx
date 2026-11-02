import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GameScreen from "@/components/GameScreen";
import { games } from "@/data/games";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return games.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = games.find((item) => item.slug === slug);
  if (!game) notFound();
  return {
    title: game.title,
    description: `${game.description}. Practise with ${game.title} at Mr. Mata Learning Hub.`,
  };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const game = games.find((item) => item.slug === slug);
  if (!game) notFound();
  if (game.status === "Soon") {
    return (
      <section className="panel p-6 md:p-10">
        <h1 className="font-display text-4xl font-bold">{game.title}</h1>
        <p className="mt-4 max-w-prose text-muted">
          Truth tables and circuits are coming soon. In the meantime, practise
          binary place values or choose another game from the menu.
        </p>
        <Link href="/games/binary-builder" className="icon-button mt-6">
          Play Binary Builder
        </Link>
      </section>
    );
  }
  return <GameScreen key={game.id} gameId={game.id} title={game.title} />;
}
