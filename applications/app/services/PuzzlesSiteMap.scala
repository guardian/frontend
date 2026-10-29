package services

import scala.xml.Elem

object PuzzlesSiteMap {
  private val paths = Seq(
    "/puzzles-and-games",
    "/puzzles-and-games/crosswords/archive",
    "/puzzles-and-games/logic-puzzles/archive",
    "/puzzles-and-games/word-games/archive",
  )

  // Canonical production URLs, independent of the request's host or experiment cookies.
  val xml: Elem =
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      {paths.map(path => <url><loc>{s"https://www.theguardian.com$path"}</loc></url>)}
    </urlset>
}
