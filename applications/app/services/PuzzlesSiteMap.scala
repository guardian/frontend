package services

import scala.xml.Elem

object PuzzlesSiteMap {
  private val paths = Seq(
    "/puzzles-and-games",
    "/puzzles-and-games/crosswords/archive",
    "/puzzles-and-games/logic-puzzles/archive",
    "/puzzles-and-games/word-games/archive",
  )

  private val triviaPath = "/puzzles-and-games/trivia-and-quizzes/archive"

  // Canonical production URLs, independent of the request's host or experiment cookies.
  // Trivia & quizzes is only listed once hub v2 is enabled, because the page 404s without it.
  def xml(puzzleArchivePaths: Seq[String], includeTrivia: Boolean): Elem =
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      {
      ((paths ++ Option.when(includeTrivia)(triviaPath).toSeq) ++ puzzleArchivePaths).distinct.map(path =>
        <url><loc>{s"https://www.theguardian.com$path"}</loc></url>,
      )
    }
    </urlset>
}
