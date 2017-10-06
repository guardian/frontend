package controllers

import com.gu.contentapi.client.model.v1.{ItemResponse, Content => ApiContent}
import common._
import conf.switches.Switches
import contentapi.ContentApiClient
import model._
import pages.ContentHtmlPage
import play.api.mvc._
import services.ImageQuery
import views.support.RenderOtherStatus

import scala.concurrent.Future

case class ImageContentPage(image: ImageContent, related: RelatedContent) extends ContentPage {
  override lazy val item = image
}

class ImageContentController(
  val contentApiClient: ContentApiClient,
  val controllerComponents: ControllerComponents
)(implicit context: ApplicationContext)
  extends BaseController with RendersItemResponse with ImageQuery with Logging with ImplicitControllerExecutionContext {

  def renderJson(path: String): Action[AnyContent] = render(path)

  def render(path: String): Action[AnyContent] = Action.async { implicit request => renderItem(path) }

  private def renderImageContent(page: ImageContentPage)(implicit request: RequestHeader): Result = {
    val htmlResponse = () => ContentHtmlPage.html(page)
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
