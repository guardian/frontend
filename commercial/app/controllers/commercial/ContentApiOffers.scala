package controllers.commercial

import common.ExecutionContexts
import model.commercial.Lookup
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._

import scala.concurrent.Future

object ContentApiOffers extends Controller with ExecutionContexts {

  private def renderItems(format: Format) = MemcachedAction { implicit request =>
    val optKeyword = request.queryString get "k" map (_.head)
    
    val optLogo = request.queryString get "l" map (_.head)

    val futureLatestByKeyword = optKeyword.map { keyword =>
      Lookup.latestContentByKeyword(keyword, 4)
    }.getOrElse(Future.successful(Nil))

    val futureContents = for {
      specific <- Lookup.contentByShortUrls(specificIds)
      latestByKeyword <- futureLatestByKeyword
    } yield (specific ++ latestByKeyword).distinct take 4

    futureContents map {
      case Nil => NoCache(format.nilResult)
      case contents => Cached(componentMaxAge) {
        format.result(views.html.contentapi.items(contents, optLogo))
      }
    }
  }

  def itemsHtml = renderItems(htmlFormat)

  def itemsJson = renderItems(jsonFormat)
}
