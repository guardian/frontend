package controllers.commercial

import common.{ExecutionContexts, Logging}
import contentapi.ContentApiClient
import model.commercial.{CapiAgent, Lookup}
import model.ContentType
import play.api.mvc.{AnyContent, Controller, Request}

import scala.concurrent.Future
import scala.util.control.NonFatal

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

}
