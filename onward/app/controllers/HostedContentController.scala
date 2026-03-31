package controllers

import common._
import containers.Containers
import contentapi.ContentApiClient
import implicits.Requests
import model._
import model.dotcomrendering.{OnwardCollectionResponse, Trail}
import play.api.libs.json._
import play.api.mvc._
import views.support.FaciaToMicroFormat2Helpers.isCuratedContent

import scala.concurrent.Future
import scala.concurrent.duration._

class HostedContentController(val contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents)(
    implicit context: ApplicationContext,
) extends OnwardContentCardController(contentApiClient, controllerComponents)
    with BaseController
    with GuLogging
    with ImplicitControllerExecutionContext
    with Requests {

  private[this] def getContent(section: String)(implicit request: RequestHeader): Future[Option[ContentType]] = {
    val fields = "headline,shortUrl,webUrl,thumbnail"
    val path = s"section/$section"
    val response = lookup(path, fields)(request)
    response.map(_.content.map(Content(_)))
  }

  def render(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      getContent(path) map {
        case Some(content) if request.forceDCR =>
          Cached(900)(JsonComponent.fromWritable(content)(request, Content.writes))
      }
//        items => {
//        val json = JsonComponent.fromWritable(
//          OnwardCollectionResponse(
//            heading = "More on this story",
//            trails = items.map(_.faciaContent).map(Trail.pressedContentToTrail).take(10),
//          ),
//        )
//        Cached(5.minutes)(json)
      })
    }
}
