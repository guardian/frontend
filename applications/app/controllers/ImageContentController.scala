package controllers

import com.gu.contentapi.client.Parameter
import com.gu.contentapi.client.model.{ItemQuery, SearchQuery, SearchQueryBase}
import com.gu.contentapi.client.model.v1.{ItemResponse, Content => ApiContent}
import common._
import common.`package`.NotFound
import conf.switches.Switches
import contentapi.ContentApiClient
import model._
import pages.ContentHtmlPage
import play.api.libs.ws.WSClient
import play.api.mvc._
import services.ImageQuery
import views.support.RenderOtherStatus
import play.api.libs.json._
import play.api.libs.functional.syntax._

import scala.concurrent.Future

case class ImageContentPage(image: ImageContent, related: RelatedContent) extends ContentPage {
  override lazy val item = image
}

class ImageContentController(
  val contentApiClient: ContentApiClient,
  val controllerComponents: ControllerComponents,
  wsClient: WSClient
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

  def getNextLightbox(path: String, tag: String, direction: String): Action[AnyContent] = Action.async { implicit request =>
    println(path)
    println(s"$path/next")


    println(tag)
    wsClient.url(s"${contentApiClient.thriftClient.targetUrl}/content/$path/$direction?tag=$tag").get().flatMap {
      stuff =>
        val result = stuff.json("response")("results")(0)("id").as[String]
        renderItem(result)
    }
  }

  def getNextLightboxJson(path: String, tag: String, direction: String): Action[AnyContent] = Action.async { implicit request =>

    val capiquery = ContentApiNavQuery(currentId = path).tag(tag).showTags("all").showElements("all")
    println(capiquery.pathSegment)
    println(capiquery)
    val capimod = contentApiClient.thriftClient.getResponse(capiquery).map {
      mod =>
//        println(mod)
        Content(mod.results.head) match {
          case content: ImageContent =>
            Cached(1)(JsonComponent(content.lightBox.javascriptConfig))
          case _ => InternalServerError
        }
    }
    capimod
//    wsClient.url(s"${contentApiClient.thriftClient.targetUrl}/content/$path/$direction?tag=commentisfree/series/observer-comment-cartoon&show-elements=all&show-fields=all").get().flatMap {
//      stuff =>
//        val fullres = stuff.json("response")("results")(0)
////        println(fullres)
//        val result = stuff.json("response")("results")(0)("id").as[String]
//        renderItem(result)
//    }
  }
}

case class ContentApiNavQuery(parameterHolder: Map[String, Parameter] = Map.empty, currentId: String)
  extends SearchQueryBase[ContentApiNavQuery] {
  def withParameters(parameterMap: Map[String, Parameter]): ContentApiNavQuery = copy(parameterMap)

  override def pathSegment: String = s"content/$currentId/next"
}
