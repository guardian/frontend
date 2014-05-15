package views.support

import model.{Tag, Content, MetaData}
import play.api.templates.Html
import common.{Edition, Navigation}
import play.api.mvc.RequestHeader

object Title {

  def apply(page: MetaData)(implicit request: RequestHeader): Html = Html{
    val section = Navigation.topLevelItem(Edition(request).navigation, page).map(_.name.title)
    val title = page match {
      case c: Content => s"${c.webTitle}${pagination(page)}${getSectionConsideringWebtitle(c.webTitle, section.orElse(Option(c.sectionName)))}"
      case t: Tag     => s"${t.webTitle}${pagination(page)}${getSectionConsideringWebtitle(t.webTitle, section)}"
      case _          => s"${page.title}${pagination(page)}${getSectionConsideringWebtitle(page.title, section)}"
    }
    s"${title.trim} | The Guardian"
  }

  private def getSectionConsideringWebtitle(webTitle: String, section: Option[String]): String =
    section.filterNot(_.toLowerCase == webTitle.toLowerCase).map{ s => s" | ${s.capitalize}"}.getOrElse("")

  private def pagination(page: MetaData) = page.pagination.filterNot(_.isFirstPage).map{ pagination =>
    s" | Page ${pagination.currentPage} of ${pagination.lastPage}"
  }.getOrElse("")
}
