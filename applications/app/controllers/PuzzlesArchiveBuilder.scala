package controllers

import model.dotcomrendering.{
  PuzzleContainer,
  PuzzleItem,
  PuzzlesArchive,
  PuzzlesArchiveItem,
  PuzzlesArchivePuzzle,
  PuzzlesLayout,
}

object PuzzlesArchiveBuilder {
  private val apiTypes: Map[(String, String), String] = Map(
    ("crossword", "quick") -> "CROSSWORD_QUICK",
    ("crossword", "genius") -> "CROSSWORD_GENIUS",
    ("crossword", "mini") -> "CROSSWORD_MINI",
    ("crossword", "cryptic") -> "CROSSWORD_CRYPTIC",
    ("crossword", "weekend") -> "CROSSWORD_WEEKEND",
    ("crossword", "quick-cryptic") -> "CROSSWORD_QUICKCRYPTIC",
    ("crossword", "quiptic") -> "CROSSWORD_QUIPTIC",
    ("crossword", "prize") -> "CROSSWORD_PRIZE",
    ("crossword", "sunday-quick") -> "CROSSWORD_SUNDAYQUICK",
    ("sudoku", "easy") -> "SUDOKU_EASY",
    ("sudoku", "medium") -> "SUDOKU_MEDIUM",
    ("sudoku", "hard") -> "SUDOKU_HARD",
    ("sudoku", "killer") -> "SUDOKU_KILLER",
    ("word-wheel", "all") -> "WORDWHEEL",
    ("film-reveal", "all") -> "FILMREVEAL",
    ("on-the-ball", "all") -> "ONTHEBALL",
  )

  def apiType(puzzleType: String, set: String): Option[String] = apiTypes.get((puzzleType, set))

  case class Selection(
      category: String,
      title: String,
      description: String,
      puzzle: PuzzlesArchivePuzzle,
      puzzles: Seq[PuzzlesArchivePuzzle],
      apiType: String,
  )

  private def items(container: PuzzleContainer): Seq[PuzzleItem] =
    container.content.items.flatten ++ container.content.nestedContainers.flatMap(items)

  private def archiveItems(container: PuzzleContainer): Seq[PuzzleItem] =
    if (container.id == "crosswords") container.content.archiveChoices.getOrElse(Nil)
    else items(container)

  private def toPuzzle(item: PuzzleItem): Option[(PuzzlesArchivePuzzle, String)] =
    apiTypes.get((item.`type`, item.set)).map { apiType =>
      PuzzlesArchivePuzzle(item.id, item.title, apiType, item.slug, item.set) -> apiType
    }

  def select(layout: PuzzlesLayout, category: String, selected: Option[String]): Option[Selection] = {
    val container = layout.containers.find(_.id == category)
    val candidates = container.toSeq.flatMap(archiveItems).flatMap(toPuzzle)
    val chosen = selected
      .flatMap(value =>
        candidates.find { case (puzzle, _) =>
          puzzle.id == value || puzzle.set == value || puzzle.slug.exists(_.split('/').lastOption.contains(value))
        },
      )
      .orElse(candidates.headOption)

    chosen.map { case (puzzle, apiType) =>
      val (title, description) = category match {
        case "crosswords" =>
          "Crosswords" -> "Play the full archive of crosswords from the Guardian. Track your progress of what you've played and started."
        case "word-games" =>
          "Word games" -> "Play the full archive of word games from the Guardian. Track your progress of what you've played and started."
        case "logic-puzzles" =>
          "Logic puzzles" -> "Play the full archive of logic puzzles from the Guardian. Track your progress of what you've played and started."
        case "trivia-and-quizzes" =>
          "Trivia & quizzes" -> "Play the full archive of trivia and quizzes from the Guardian. Track your progress of what you've played and started."
        case _ => container.map(_.title).getOrElse("Puzzles") -> "Choose a puzzle from our archive."
      }
      Selection(category, title, description, puzzle, candidates.map(_._1), apiType)
    }
  }

  def destination(selection: Selection, item: PuzzlesApiItem): String =
    if (selection.puzzle.puzzleType.startsWith("CROSSWORD_"))
      item.gameUrl
        .filter(_.trim.nonEmpty)
        .getOrElse(
          throw new IllegalArgumentException("Crossword archive item is missing gameUrl"),
        )
    else {
      val slug = selection.puzzle.slug.flatMap(_.split('/').lastOption).getOrElse(selection.puzzle.id)
      s"/puzzles-and-games/${selection.category}/$slug/${item.publishDate.take(10)}"
    }

  /** The key of the puzzle being browsed, used to look up its "More from Puzzles & games" recommendations. */
  def relatedPuzzleKey(selection: Selection): String =
    if (selection.category == "crosswords") selection.puzzle.set
    else selection.puzzle.slug.flatMap(_.split('/').lastOption).getOrElse(selection.puzzle.id)

  /** Every archive item, wherever it is listed (the month's calendar or the recent cards), is built here so that none
    * of them can drop a field such as the game status.
    */
  private def archiveItem(selection: Selection, item: PuzzlesApiItem): PuzzlesArchiveItem =
    PuzzlesArchiveItem(
      item.puzzleType,
      item.publishDate.take(10),
      item.progress,
      item.setterName,
      destination(selection, item),
      item.gameStatus,
    )

  def build(
      selection: Selection,
      year: Int,
      month: Int,
      items: Seq[PuzzlesApiItem],
      hasError: Boolean,
      moreFrom: Seq[PuzzleItem],
      recentItems: Option[Seq[PuzzlesApiItem]] = None,
  ): PuzzlesArchive = {
    // Missing crossword destinations must not become fabricated links in either list.
    def playable(values: Seq[PuzzlesApiItem]): Seq[PuzzlesApiItem] =
      values.filter(item =>
        item.puzzleType == selection.apiType &&
          (!selection.apiType.startsWith("CROSSWORD_") || item.gameUrl.exists(_.trim.nonEmpty)),
      )

    PuzzlesArchive(
      category = selection.category,
      title = selection.title,
      description = selection.description,
      selectedPuzzle = selection.puzzle,
      puzzles = selection.puzzles,
      year = year,
      month = month,
      items = playable(items).map(archiveItem(selection, _)),
      hasError = hasError,
      moreFrom = moreFrom,
      recentItems = playable(recentItems.getOrElse(items))
        .sortBy(_.publishDate)
        .reverse
        .take(3)
        .map(archiveItem(selection, _)),
    )
  }
}
