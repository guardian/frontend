package views.support

import model.{Tag, Content, MetaData}
import play.api.templates.Html
import play.api.mvc.RequestHeader

object Title {

  def apply(page: MetaData)(implicit request: RequestHeader): Html = Html{
    val title = page match {
      case c: Content => s"${c.webTitle}${pagination(page)}${getSectionConsideringWebtitle(c.webTitle, Option(page.section).orElse(Option(c.sectionName)))}"
      case t: Tag     => s"${t.webTitle}${pagination(page)}${getSectionConsideringWebtitle(t.webTitle, Option(page.section))}"
      case _          => s"${page.title}${pagination(page)}${getSectionConsideringWebtitle(page.title, Option(page.section))}"
    }
    s"${title.trim} | The Guardian"
  }

  private def getSectionConsideringWebtitle(webTitle: String, section: Option[String]): String =
    section.filter(_.nonEmpty).filterNot(_.toLowerCase == webTitle.toLowerCase).fold(""){ s => s" | ${s.capitalize}"}

  private def pagination(page: MetaData) = page.pagination.filterNot(_.isFirstPage).map{ pagination =>
    s" | Page ${pagination.currentPage} of ${pagination.lastPage}"
  }.getOrElse("")
}
