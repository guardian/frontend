package controllers

import common.{ImplicitControllerExecutionContext, Logging}
import contentapi.ContentApiClient
import implicits.Requests
import model.{ApplicationContext, Content, ContentType}
import play.api.mvc.{ControllerComponents, RequestHeader}

import scala.concurrent.Future

class RichLinkController(contentApiClient: ContentApiClient, controllerComponents: ControllerComponents)(implicit context: ApplicationContext) extends OnwardContentCardController(contentApiClient, controllerComponents) with Paging with Logging with ImplicitControllerExecutionContext with Requests   {

  def render(path: String) = Action.async { implicit request =>
    contentType(path) map {
        case Some(content) => renderContent(richLinkHtml(content), richLinkBodyHtml(content))
        case None => NotFound
    }
  }

  private def contentType(path: String)(implicit request: RequestHeader): Future[Option[ContentType]] = {
    val fields = "headline,standfirst,shortUrl,webUrl,byline,starRating,trailText,liveBloggingNow"
    val response = lookup(path, fields)(request)
    response map { _.content.map(Content(_)) }
  }

  private def richLinkHtml(content: ContentType)(implicit request: RequestHeader, context: ApplicationContext) =
    views.html.richLink(content)(request, context)

  private def richLinkBodyHtml(content: ContentType)(implicit request: RequestHeader, context: ApplicationContext) =
    views.html.fragments.richLinkBody(content)(request)

}
