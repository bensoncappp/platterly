import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { sumMacros } from "@/lib/totals";
import styles from "../components/Boards.module.css";

// In Next 16 searchParams is a Promise.
type Props = { searchParams: Promise<{ q?: string }> };

export default async function BoardsPage({ searchParams }: Props) {
  const q = ((await searchParams).q ?? "").trim().toLowerCase();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div>
        <h1 className={styles.pageTitle}>Your Saved Boards</h1>
        <p>Sign in (top right) to see your boards.</p>
      </div>
    );
  }

  // Each board with the macros of every meal linked to it through board_meals.
  const { data: boards, error } = await supabase
    .from("boards")
    .select(
      "id, name, board_meals(meals(calories, protein, fat, carbs, image_url))",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return <p>Failed to load boards: {error.message}</p>;
  }

  if (!boards || boards.length === 0) {
    return (
      <div>
        <h1 className={styles.pageTitle}>Your Saved Boards</h1>
        <p>No boards yet — use "Add to board" on a saved meal to create one.</p>
      </div>
    );
  }

  // Search boards by name.
  const shown = boards.filter((b: any) => b.name.toLowerCase().includes(q));

  return (
    <div>
      <h1 className={styles.pageTitle}>Your Saved Boards</h1>

      {shown.length === 0 ? (
        <p>No boards match "{q}".</p>
      ) : (
        <div className={styles.boardGrid}>
          {shown.map((board: any) => {
            const meals = (board.board_meals ?? [])
              .map((bm: any) => bm.meals)
              .filter(Boolean);
            const totals = sumMacros(meals);
            const thumbs = meals
              .map((m: any) => m.image_url)
              .filter(Boolean)
              .slice(0, 3); // the collage uses at most 3 photos

            return (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                className={styles.boardLink}
              >
                <div
                  className={`${styles.boardCard} ${styles[`collage${thumbs.length}`] ?? ""}`}
                >
                  {thumbs.map((src: string, i: number) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className={styles.boardThumb}
                    />
                  ))}
                </div>
                <div className={styles.boardMeta}>
                  <span className={styles.boardName}>{board.name}</span>
                  <span className={styles.boardTotals}>
                    ={Math.round(totals.calories)}kcal
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}