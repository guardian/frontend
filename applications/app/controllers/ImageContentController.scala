package controllers

import com.gu.contentapi.client.model.v1.{ItemResponse, Content => ApiContent}
import common._
import conf._
import conf.switches.Switches
import contentapi.ContentApiClient
import model._
import play.api.Environment
import play.api.mvc.{Action, Controller, RequestHeader, Result}
import services.ImageQuery
import views.support.RenderOtherStatus

import scala.concurrent.Future

case class ImageContentPage(image: ImageContent, related: RelatedContent) extends ContentPage {
  override lazy val item = image
}

class ImageContentController(val contentApiClient: ContentApiClient)(implicit env: Environment) extends Controller with RendersItemResponse with ImageQuery with Logging with ExecutionContexts {

  def renderJson(path: String) = render(path)

  def render(path: String) = Action.async { implicit request => renderItem(path) }

  private def renderImageContent(page: ImageContentPage)(implicit request: RequestHeader): Result = {
    val htmlResponse = () => views.html.imageContent(page)
    val jsonResponse = () => views.html.fragments.imageContentBody(page)
    renderFormat(htmlResponse, jsonResponse, page, Switches.all)
  }

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = image(Edition(request), path).map {
    case Left(content) => renderImageContent(content)
    case Right(result) => RenderOtherStatus(result)
  }

  private def isSupported(c: ApiContent) = c.isImageContent
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
}
