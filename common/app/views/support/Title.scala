package views.support

import model.{Tag, Content, MetaData}
import play.api.templates.Html
import common.{Edition, Navigation}
import play.api.mvc.RequestHeader

object Title {

  def apply(page: MetaData)(implicit request: RequestHeader): Html = Html{
    val section = Navigation.topLevelItem(Edition(request).navigation(page), page).map(_.name.title)
    val title = page match {
      case c: Content =>  s"${c.webTitle} | ${section.getOrElse(c.sectionName)} | theguardian.com${pagination(page)}"
      case t: Tag =>  s"${t.webTitle}${section.map(s => s" | $s").getOrElse("")} | theguardian.com${pagination(page)}"
      case _ => s"${page.webTitle} | theguardian.com${pagination(page)}"
    }
    title.trim
  }

  private def pagination(page: MetaData) = page.pagination.filterNot(_.isFirstPage).map{ pagination =>
    s" | Page ${pagination.currentPage} of ${pagination.lastPage}"
  }.getOrElse("")
}
