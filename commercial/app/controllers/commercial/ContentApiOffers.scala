package controllers.commercial

import common.ExecutionContexts
import model.commercial.Lookup
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._

object ContentApiOffers extends Controller with ExecutionContexts {

  private def renderItem(contentId: String, format: Format) = MemcachedAction { implicit request =>
    Lookup.content(contentId) map {
      case Some(content) => Cached(componentMaxAge) {
        format.result(views.html.contentapi.item(content))
      }
      case None => NoCache(format.nilResult)
    }
  }

  def itemHtml(contentId: String) = renderItem(contentId, htmlFormat)

  def itemJson(contentId: String) = renderItem(contentId, jsonFormat)
}
