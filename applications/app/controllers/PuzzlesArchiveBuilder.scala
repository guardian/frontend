package controllers

import model.dotcomrendering.{
  PuzzleContainer,
  PuzzleItem,
  PuzzlesArchive,
  PuzzlesArchiveItem,
  PuzzlesArchivePuzzle,
  PuzzlesLayout,
}

import java.net.URLEncoder
import java.nio.charset.StandardCharsets

object PuzzlesArchiveBuilder {
  private val apiTypes: Map[(String, String), String] = Map(
    ("crossword", "quick") -> "CROSSWORD_QUICK",
    ("crossword", "mini") -> "CROSSWORD_MINI",
    ("crossword", "cryptic") -> "CROSSWORD_CRYPTIC",
    ("crossword", "quick-cryptic") -> "CROSSWORD_QUICKCRYPTIC",
    ("crossword", "weekend") -> "CROSSWORD_WEEKEND",
    ("crossword", "prize") -> "CROSSWORD_PRIZE",
    ("crossword", "quiptic") -> "CROSSWORD_QUIPTIC",
    ("crossword", "sunday-quick") -> "CROSSWORD_SUNDAYQUICK",
    ("sudoku", "easy") -> "SUDOKU_EASY",
    ("sudoku", "medium") -> "SUDOKU_MEDIUM",
    ("sudoku", "hard") -> "SUDOKU_HARD",
    ("sudoku", "killer") -> "SUDOKU_KILLER",
    ("word-wheel", "all") -> "WORDWHEEL",
    ("wordiply", "all") -> "WORDIPLY",
  )

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
          "Crosswords" -> "Choose a crossword from our archive, and track which ones you’ve completed, started or are yet to play."
        case "word-games"    => "Word games" -> "Choose a word game from our archive."
        case "logic-puzzles" => "Logic puzzles" -> "Choose a logic puzzle from our archive."
        case _               => container.map(_.title).getOrElse("Puzzles") -> "Choose a puzzle from our archive."
      }
      Selection(category, title, description, puzzle, candidates.map(_._1), apiType)
    }
  }

  def destination(selection: Selection, item: ArchiveApiItem): String =
    item.url.filter(url => url.startsWith("/") || url.startsWith("https://")).getOrElse {
      if (selection.puzzle.puzzleType.startsWith("CROSSWORD_"))
        s"/crosswords/${selection.puzzle.set}/${item.puzzleId}"
      else {
        val slug = selection.puzzle.slug.flatMap(_.split('/').lastOption).getOrElse(selection.puzzle.id)
        val encodedId = URLEncoder.encode(item.puzzleId, StandardCharsets.UTF_8.toString)
        s"/puzzles-and-games/${selection.category}/$slug/${item.date}?puzzleId=$encodedId"
      }
    }

  def related(layout: PuzzlesLayout, selectedCategory: String): Seq[PuzzleItem] =
    layout.containers
      .filter(container =>
        Set("crosswords", "word-games", "logic-puzzles").contains(container.id) && container.id != selectedCategory,
      )
      .flatMap(archiveItems)
      .filter(item => apiTypes.contains((item.`type`, item.set)))
      .take(3)

  def build(
      selection: Selection,
      layout: PuzzlesLayout,
      year: Int,
      month: Int,
      items: Seq[ArchiveApiItem],
      dataUrl: String,
      hasError: Boolean,
  ): PuzzlesArchive =
    PuzzlesArchive(
      category = selection.category,
      title = selection.title,
      description = selection.description,
      selectedPuzzle = selection.puzzle,
      puzzles = selection.puzzles,
      year = year,
      month = month,
      items = items.map(item =>
        PuzzlesArchiveItem(
          item.puzzleId,
          item.puzzleType,
          item.date,
          item.progress,
          item.setterName,
          destination(selection, item),
        ),
      ),
      dataUrl = dataUrl,
      hasError = hasError,
      moreFrom = related(layout, selection.category),
    )
}
