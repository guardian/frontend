package views.support

import model.{Tag, Content, MetaData}
import play.api.templates.Html
import play.api.mvc.RequestHeader
import common.{Edition, Navigation}

object Title {

  def apply(page: MetaData)(implicit request: RequestHeader): Html = Html{
    val section: String = Navigation.topLevelItem(Edition(request).navigation, page).map(_.name.title).getOrElse(page.section)
    val title = page match {
      case c: Content => s"${c.webTitle}${pagination(page)}${getSectionConsideringWebtitle(c.webTitle, Option(section))}"
      case t: Tag     => s"${t.webTitle}${pagination(page)}${getSectionConsideringWebtitle(t.webTitle, Option(section))}"
      case _          => s"${page.title}${pagination(page)}${getSectionConsideringWebtitle(page.title, Option(section))}"
    }
    s"${title.trim} | The Guardian"
  }

  private def getSectionConsideringWebtitle(webTitle: String, section: Option[String]): String =
    section.filter(_.nonEmpty).filterNot(_.toLowerCase == webTitle.toLowerCase).fold(""){ s => s" | ${s.capitalize}"}

  private def pagination(page: MetaData) = page.pagination.filterNot(_.isFirstPage).map{ pagination =>
    s" | Page ${pagination.currentPage} of ${pagination.lastPage}"
  }.getOrElse("")
}
