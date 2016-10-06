package controllers.commercial

import common.{Edition, ExecutionContexts, JsonComponent, Logging}
import contentapi.ContentApiClient
import model.commercial.{CapiAgent, CapiSingle, Lookup}
import model.{Cached, ContentType}
import play.api.mvc.{Action, AnyContent, Controller, Request}

import scala.concurrent.Future
import scala.util.control.NonFatal
import scala.concurrent.duration.DurationInt

class TrafficDriverController(
    contentApiClient: ContentApiClient,
    capiAgent: CapiAgent)
  extends Controller
  with ExecutionContexts
  with implicits.Requests
  with Logging {

    private val lookup = new Lookup(contentApiClient)

    private def retrieveContent()(implicit request: Request[AnyContent]):
        Future[Seq[ContentType]] = {

        val content: Future[Seq[model.ContentType]] =
            capiAgent.contentByShortUrls(specificIds)

        content onFailure {
            case NonFatal(e) => log.error(
                s"Looking up content by short URL failed: ${e.getMessage}"
            )
        }

        content

    }

    private def renderJson() = Action.async { implicit request =>

        retrieveContent().map {
            case Nil => Cached(componentNilMaxAge){ jsonFormat.nilResult }
            case content :: _ => Cached(60.seconds) {
                JsonComponent(CapiSingle.fromContent(content, Edition(request)))
            }
        }

    }

}
