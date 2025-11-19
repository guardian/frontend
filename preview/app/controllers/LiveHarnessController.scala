package controllers

import com.gu.contentapi.client.model.v1.{Blocks, Content => ApiContent}
import com.gu.facia.api.utils.ContentApiUtils.RichContent
import model.{ApplicationContext, ArticleBlocks, ArticlePage}
import play.api.libs.json.JsValue
import play.api.mvc.{Action, ControllerComponents, RequestHeader, Result}
import services.CAPILookup
import utils.{LiveHarness, LiveHarnessInteractiveAtom}
import contentapi.ContentApiClient
import model.dotcomrendering.PageType
import play.api.libs.ws.WSClient
import renderers.DotcomRenderingService

import scala.concurrent.Future

class LiveHarnessController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
    ws: WSClient,
)(implicit
    val
    context: ApplicationContext,
) extends ArticleControllerCommon {
  override protected def isSupported(c: ApiContent): Boolean = c.isArticle
  val capiLookup: CAPILookup = new CAPILookup(contentApiClient)

  def renderLiveHarness(path: String): Action[JsValue] = {
    Action.async(parse.json) { implicit request =>
      request.body.validate[List[LiveHarnessInteractiveAtom]].asEither match {
        case Right(value) =>
          mapModel(path, ArticleBlocks) { (article, blocks) =>
            val (newArticle, newBlocks) = LiveHarness.injectInteractiveAtomsIntoArticle(value, article, blocks)
            renderContent(newArticle, newBlocks)
          }
        case Left(value) => Future(BadRequest(value.toString()))
      }
    }
  }

  private def renderContent(article: ArticlePage, blocks: Blocks)(implicit
      request: RequestHeader,
  ): Future[Result] = {

    val pageType: PageType = PageType(article, request, context)
    DotcomRenderingService().getArticle(
      ws,
      article,
      blocks,
      pageType,
      None,
    )
  }
}
