package controllers

import com.gu.contentapi.client.model.v1.{Blocks, ItemResponse, Content => ApiContent}
import common.{GuLogging, ImplicitControllerExecutionContext, ModelOrResult}
import common.`package`.convertApiExceptions
import model.{ApplicationContext, Article, ArticlePage, BlockRange, Content, ContentType, StoryPackages}
import play.api.mvc.{BaseController, RequestHeader, Result, Results}
import services.CAPILookup
import views.support.RenderOtherStatus

import scala.concurrent.Future

trait ArticleControllerCommon
    extends BaseController
    with GuLogging
    with Results
    with ImplicitControllerExecutionContext {

  val capiLookup: CAPILookup
  implicit val context: ApplicationContext

  protected def isSupported(c: ApiContent): Boolean

  protected def mapModel(path: String, range: BlockRange)(
      render: (ArticlePage, Blocks) => Future[Result],
  )(implicit request: RequestHeader): Future[Result] = {
    capiLookup
      .lookup(path, Some(range))
      .map(responseToModelOrResult)
      .recover(convertApiExceptions)
      .flatMap {
        case Right((model, blocks)) => render(model, blocks)
        case Left(other)            => Future.successful(RenderOtherStatus(other))
      }
  }

  private def responseToModelOrResult(
      response: ItemResponse,
  )(implicit request: RequestHeader): Either[Result, (ArticlePage, Blocks)] = {
    val supportedContent: Option[ContentType] = response.content.filter(isSupported).map(Content(_))
    val blocks = response.content.flatMap(_.blocks).getOrElse(Blocks())

    ModelOrResult(supportedContent, response) match {
      case Right(article: Article) =>
        Right((ArticlePage(article, StoryPackages(article.metadata.id, response)), blocks))
      case Left(r) => Left(r)
      case _       => Left(NotFound)
    }
  }
}
