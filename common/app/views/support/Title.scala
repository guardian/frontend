package views.support

import model.{Tag, Content, MetaData}
import play.api.templates.Html
import common.{Edition, Navigation}
import play.api.mvc.RequestHeader

object Title {

  def apply(page: MetaData)(implicit request: RequestHeader): Html = Html{
    val section = Navigation.topLevelItem(Edition(request).navigation, page).map(_.name.title)
    val title = page match {
      case c: Content => s"${c.webTitle}${pagination(page)} | ${section.getOrElse(c.sectionName).capitalize}"
      case t: Tag     => s"${t.webTitle}${pagination(page)}${section.map(s => s" | ${s.capitalize}").getOrElse("")}"
      case _          => s"${page.webTitle}${pagination(page)}${section.map(s => s" | ${s.capitalize}").getOrElse("")}"
    }
    s"${title.trim} | The Guardian"
  }

  private def pagination(page: MetaData) = page.pagination.filterNot(_.isFirstPage).map{ pagination =>
    s" | Page ${pagination.currentPage} of ${pagination.lastPage}"
  }.getOrElse("")
}
