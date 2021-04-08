package test

import com.gu.contentapi.client.model.v1.Blocks
import model.Cached.RevalidatableResult
import model.dotcomrendering.PageType
import model.{ApplicationContext, Cached, PageWithStoryPackage}
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result}
import play.twirl.api.Html

import scala.concurrent.{ExecutionContext, Future}

// It is always a mistake to rely on actual DCR output for tests.
class DCRFake(implicit context: ApplicationContext) extends renderers.DotcomRenderingService {
  override def getArticle(
      ws: WSClient,
      path: String,
      article: PageWithStoryPackage,
      blocks: Blocks,
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {
    implicit val ec = ExecutionContext.global
    Future(
      Cached(article)(RevalidatableResult.Ok(Html("FakeRemoteRender has found you out if you rely on this markup!"))),
    )
  }
}
