package controllers

import common._
import containers.Containers
import contentapi.ContentApiClient
import feed.MostReadAgent
import model._
import play.api.libs.ws.WSClient
import play.api.mvc._
import renderers.DotcomRenderingService
import services._

import scala.concurrent.Future

class PopularInTagDCR(
    val contentApiClient: ContentApiClient,
    val mostReadAgent: MostReadAgent,
    val controllerComponents: ControllerComponents,
    val wsClient: WSClient,
)(implicit context: ApplicationContext)
    extends BaseController
    with Related
    with Containers
    with GuLogging
    with ImplicitControllerExecutionContext
    with GetPopularInTagDCR
    with implicits.Requests {

  val remoteRenderer: DotcomRenderingService = DotcomRenderingService()

  def render(tag: String): Action[AnyContent] = {
    Action.async { implicit request =>
      val edition = Edition(request)
      val excludeTags = request.queryString.getOrElse("exclude-tag", Nil)
      getPopularInTagTrails(edition, tag, excludeTags).flatMap {
        case onwards if onwards.trails.isEmpty => Future.successful(Cached(60)(JsonNotFound()))
        case onwards                           => remoteRenderer.getOnwardHtml(wsClient, onwards)
      }
    }
  }
}
