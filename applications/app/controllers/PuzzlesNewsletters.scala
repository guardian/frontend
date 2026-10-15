package controllers

import common.GuLogging
import model.dotcomrendering.{PuzzleGameSupporting, PuzzleLink, PuzzlesNewsletter}
import services.newsletters.NewsletterSignupAgent

class PuzzlesNewsletters(newsletterSignupAgent: NewsletterSignupAgent) extends GuLogging {

  def live(identityName: String): Option[PuzzlesNewsletter] =
    newsletterSignupAgent.getV2NewsletterByName(identityName) match {
      case Right(Some(newsletter)) if !newsletter.restricted && newsletter.status == "live" =>
        Some(
          PuzzlesNewsletter(
            identityName = newsletter.identityName,
            name = newsletter.name,
            frequency = newsletter.frequency,
            description = newsletter.signUpEmbedDescription,
            // Most newsletters only have the 5:3 card art; DCR crops it to a circle.
            illustrationSquare = newsletter.illustrationSquare.orElse(newsletter.illustrationCard),
            exampleUrl = newsletter.exampleUrl.map(_.trim).filter(_.nonEmpty).map(PuzzlesNewsletters.siteUrl),
          ),
        )
      case Right(_) =>
        log.warn(s"Puzzles newsletter '$identityName' is not a live newsletter; omitting it")
        None
      case Left(error) =>
        log.warn(s"Puzzles newsletter '$identityName' could not be looked up; omitting it: $error")
        None
    }

  /** Useful links and newsletter for an individual game page, or `None` when there is nothing to show. */
  def forGame(usefulLinks: Seq[PuzzleLink]): Option[PuzzleGameSupporting] = {
    val newsletter = live(PuzzlesNewsletters.GameNewsletterIdentityName)
    Option.when(usefulLinks.nonEmpty || newsletter.nonEmpty)(PuzzleGameSupporting(usefulLinks, newsletter))
  }
}

object PuzzlesNewsletters {
  val GameNewsletterIdentityName = "cluesletter"

  // The newsletters tool stores some example URLs as site paths without a leading slash.
  def siteUrl(url: String): String =
    if (url.matches("https?://.+")) url else s"/${url.stripPrefix("/")}"

  val CrosswordLinks: Seq[PuzzleLink] = Seq(
    PuzzleLink("Crossword setter A-Z", "https://www.theguardian.com/crosswords/search"),
    PuzzleLink("Crossword blog", "https://www.theguardian.com/crosswords/crossword-blog"),
  )
}
