package views.support

import common.Localisation
import common.commercial.hosted.HostedPage
import model._
import play.api.mvc.RequestHeader
import play.twirl.api.Html

object Title {
  // Sections added to this list won't be included in the page title.
  // for example if we wanted `Page Title | The Guardian` instead of `Page Title | Section Name | The Guardian`
  val SectionsToIgnore = Set(
    "global",
    "newsletter-signup-page",
  )

  def apply(page: Page)(implicit request: RequestHeader): Html =
    Html {
      val title = page match {
        case pressedPage: PressedPage =>
          pressedPage.metadata.title
            .filter(_.nonEmpty)
            .map(Localisation(_))
            .getOrElse(
              s"${Localisation(page.metadata.webTitle)}${pagination(page)}",
            )
        case c: ContentPage =>
          s"${c.metadata.webTitle}${pagination(c)}${getSectionConsideringWebtitle(c.metadata.webTitle, Option(c.item.trail.sectionName))}"
        case t: Tag =>
          s"${Localisation(t.metadata.webTitle)}${pagination(page)}${getSectionConsideringWebtitle(t.metadata.webTitle, Option(t.properties.sectionName))}"
        case s: Section =>
          s"${Localisation(s.metadata.webTitle)}${pagination(page)}"
        case hostedPage: HostedPage =>
          s"${Localisation(s"Advertiser content hosted by the Guardian: ${hostedPage.title}")}"
        case _ =>
          page.metadata.title
            .filter(_.nonEmpty)
            .map(Localisation(_))
            .getOrElse(
              s"${Localisation(page.metadata.webTitle)}${pagination(page)}${getSectionConsideringWebtitle(page.metadata.webTitle, Option(page.metadata.sectionId))}",
            )
      }
      s"${title.trim} | The Guardian"
    }

  private def titleFromSectionId(sectionId: String): String =
    sectionId.toLowerCase match {
      case "theobserver" => "The Observer"
      case _             => sectionId
    }

  private def guCapitalization(str: String): String = {
    str match {
      case "uk-news" => "UK news"
      case "us-news" => "US news"
      case _         => str.capitalize
    }
  }

  private def getSectionConsideringWebtitle(webTitle: String, section: Option[String]): String = {
    section
      .filter(_.nonEmpty)
      .filterNot(_.toLowerCase == webTitle.toLowerCase)
      .filterNot(SectionsToIgnore.contains)
      .map(titleFromSectionId)
      .fold("") { s => s" | ${guCapitalization(s)}" }
  }

  private def pagination(page: Page) =
    page.metadata.pagination
      .filterNot(_.isFirstPage)
      .map { pagination =>
        s" | Page ${pagination.currentPage} of ${pagination.lastPage}"
      }
      .getOrElse("")
}
