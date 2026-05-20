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
                PuzzleItem(
                  title = "Quick crossword",
                  `type` = "crossword",
                  set = "quick",
                ),
                PuzzleItem(
                  title = "Mini crossword",
                  `type` = "crossword",
                  set = "mini",
                ),
              ),
              Seq(
                PuzzleItem(
                  title = "Sudoku (easy)",
                  `type` = "sudoku",
                  set = "easy",
                  url = Some(
                    "https://tg.amuselabs.com/guardian/date-picker?set=guardian-sudoku-easy",
                  ),
                  index = Some(1),
                ),
              ),
            ),
            nestedContainers = Seq.empty,
          ),
        ),
      ),
    )
}