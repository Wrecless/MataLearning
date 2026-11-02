import HomePage from "@/components/HomePage";
import { games } from "@/data/games";

export default function Page() {
  return (
    <HomePage
      readyGameCount={games.filter((game) => game.status === "Ready").length}
    />
  );
}
