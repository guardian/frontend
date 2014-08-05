package controllers.commercial

import common.ExecutionContexts
import model.commercial.Lookup
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._

object ContentApiOffers extends Controller with ExecutionContexts {

  private def renderItem(format: Format) = MemcachedAction { implicit request =>
    Lookup.contentByShortUrls(specificIds) map {
      case Nil => NoCache(format.nilResult)
      case contents => Cached(componentMaxAge) {
        format.result(views.html.contentapi.items(contents))
      }
    }
  }

  def itemHtml = renderItem(htmlFormat)

  def itemJson = renderItem(jsonFormat)
}
