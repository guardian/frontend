package commercial.controllers

import commercial.model.capi.CapiAgent
import commercial.model.merchandise.TrafficDriver
import common.{Edition, ImplicitControllerExecutionContext, JsonComponent, GuLogging}
import contentapi.ContentApiClient
import model.{Cached, ContentType}
import play.api.mvc._

import scala.concurrent.Future
import scala.concurrent.duration.DurationInt
import scala.util.control.NonFatal

class TrafficDriverController(
    contentApiClient: ContentApiClient,
    capiAgent: CapiAgent,
    val controllerComponents: ControllerComponents,
) extends BaseController
    with ImplicitControllerExecutionContext
    with implicits.Requests
    with GuLogging {

  // Request information about the article from cAPI.
  private def retrieveContent()(implicit request: Request[AnyContent]): Future[Option[ContentType]] = {

    val content: Future[Option[model.ContentType]] =
      capiAgent.contentByShortUrls(specificIds).map(_.headOption)

    content.failed.foreach {
      case NonFatal(e) =>
        log.error(
          s"Looking up content by short URL failed: ${e.getMessage}",
        )
    }

    content

  }

  // Build model from cAPI data and return as JSON, or empty if nothing found.
  def renderJson(): Action[AnyContent] =
    Action.async { implicit request =>
      retrieveContent().map {
        case None => Cached(componentNilMaxAge) { jsonFormat.nilResult }
        case Some(content) =>
          Cached(60.seconds) {
            JsonComponent.fromWritable(TrafficDriver.fromContent(content, Edition(request)))
          }
      }

    }

}
