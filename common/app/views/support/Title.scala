package views.support

import model.{Tag, Content, MetaData}
import play.twirl.api.Html
import play.api.mvc.RequestHeader
import common.Localisation

object Title {

  def apply(page: MetaData)(implicit request: RequestHeader): Html = Html{
    val title = page match {
      case c: Content =>
        s"${c.webTitle}${pagination(c)}${getSectionConsideringWebtitle(c.webTitle, Option(c.sectionName))}"
      case t: Tag     =>
        s"${Localisation(t.webTitle)}${pagination(page)}${getSectionConsideringWebtitle(t.webTitle, Option(t.sectionName))}"
      case _          =>
        page.title.filter(_.nonEmpty).map(Localisation(_)).getOrElse(
          s"${Localisation(page.webTitle)}${pagination(page)}${getSectionConsideringWebtitle(page.webTitle, Option(page.section))}"
        )
    }
    s"${title.trim} | The Guardian"
  }

  private def getSectionConsideringWebtitle(webTitle: String, section: Option[String]): String =
    section.filter(_.nonEmpty).filterNot(_.toLowerCase == webTitle.toLowerCase).fold(""){ s => s" | ${s.capitalize}"}

  private def pagination(page: MetaData) = page.pagination.filterNot(_.isFirstPage).map{ pagination =>
    s" | Page ${pagination.currentPage} of ${pagination.lastPage}"
  }.getOrElse("")
}
