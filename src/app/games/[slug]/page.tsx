import type { Metadata } from "next";

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

  return <GameScreen key={game.id} gameId={game.id} title={game.title} />;
}
