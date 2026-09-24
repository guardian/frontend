package staticpages

import model.{DotcomContentType, MetaData, SectionId, SimplePage, StandalonePage}
import services.newsletters.model.NewsletterResponse

case class NewsletterRoundupPage(
    metadata: MetaData,
    groupedNewsletterResponses: List[(String, List[NewsletterResponse])],
) extends StandalonePage {
  val groupedNewslettersResponses = groupedNewsletterResponses
}

object StaticPages {

  def simpleNewslettersPage(
      id: String,
      groupedNewsletterResponses: List[(String, List[NewsletterResponse])],
  ): NewsletterRoundupPage =
    NewsletterRoundupPage(
      MetaData.make(
        id = id,
        section = Option(SectionId(value = "newsletter-signup-page")),
        webTitle = "Guardian newsletters: Sign up for our free newsletters",
        description = Some(
          "Scroll less and understand more about the subjects you care about with the Guardian's brilliant email newsletters, free to your inbox.",
        ),
        contentType = Some(DotcomContentType.Signup),
        iosType = None,
        shouldGoogleIndex = true,
      ),
      groupedNewsletterResponses,
    )

  def dcrSimpleNewsletterPage(
      id: String,
  ): SimplePage =
    SimplePage(
      MetaData.make(
        id = id,
        section = Option(SectionId(value = "newsletter-signup-page")),
        webTitle = "Guardian newsletters: Sign up for our free newsletters",
        description = Some(
          "Scroll less and understand more about the subjects you care about with the Guardian's brilliant email newsletters, free to your inbox.",
        ),
        contentType = Some(DotcomContentType.Signup),
        iosType = None,
        shouldGoogleIndex = true,
      ),
    )

  def dcrSimplePuzzlesPage(id: String): SimplePage =
    SimplePage(
      MetaData.make(
        id = id,
        section = Option(SectionId(value = "puzzles-and-games")),
        webTitle = "Puzzles and games",
        description = None,
        contentType = Some(DotcomContentType.Tag),
        iosType = None,
        shouldGoogleIndex = true,
      ),
    )

  def dcrSimplePuzzlesArchivePage(id: String, title: String, description: String): SimplePage =
    SimplePage(
      MetaData.make(
        id = id,
        section = Option(SectionId(value = "puzzles-and-games")),
        webTitle = title,
        description = Some(description),
        contentType = Some(DotcomContentType.Tag),
        iosType = None,
        shouldGoogleIndex = true,
      ),
    )

  /** A minimal, static page used for the Puzzle Page flow (see PuzzlesPageController) for the iframe-based puzzle
    * slugs, which have no per-instance CAPI content of their own - the iframe always shows "today's" puzzle from the
    * third party's own logic. Not used by, or shared with, the existing crossword article page flow.
    */
  def dcrSimplePuzzlePage(id: String, webTitle: String): SimplePage =
    SimplePage(
      MetaData.make(
        id = id,
        section = Option(SectionId(value = "puzzles")),
        webTitle = webTitle,
        description = None,
        contentType = Some(DotcomContentType.Tag),
        iosType = None,
        // Currently inert for this rendering path: DotcomPuzzlePageRenderingDataModel doesn't read or forward this
        // value to DCR, so it has no effect today. Set to true to match the confirmed product requirement (all V0
        // puzzle pages should be indexable), so this doesn't silently start excluding these pages from Google if a
        // future refactor extends the model to forward it, mirroring other page types.
        shouldGoogleIndex = true,
      ),
    )
}
