package model.dotcomrendering

object PuzzlesConfig {
  val layout: PuzzlesLayout =
    PuzzlesLayout(
      containers = Seq(
        PuzzleContainer(
          title = "Today's puzzles",
          content = PuzzleContent(
            items = Seq(
              Seq(
                PuzzleItem("Quick crossword", "crossword", "quick"),
                PuzzleItem("Mini crossword", "crossword", "mini"),
              ),
              Seq(
                PuzzleItem(
                  "Sudoku (easy)",
                  "sudoku",
                  "easy",
                  Some("https://tg.amuselabs.com/guardian/date-picker?set=guardian-sudoku-easy"),
                  Some(1),
                ),
              ),
            ),
            nestedContainers = Seq.empty,
          ),
        ),
      ),
    )
}