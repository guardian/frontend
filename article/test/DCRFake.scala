package test

import com.gu.contentapi.client.model.v1.{Block, Blocks}
import model.Cached.RevalidatableResult
import model.dotcomrendering.{FilterData, PageType}
import model.{ApplicationContext, Cached, LiveBlogPage, PageWithStoryPackage}
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result}
import play.twirl.api.Html

import scala.concurrent.duration.Duration
import scala.concurrent.{ExecutionContext, Future}

// It is always a mistake to rely on actual DCR output for tests.
class DCRFake(implicit context: ApplicationContext) extends renderers.DotcomRenderingService {
  override def getArticle(
      ws: WSClient,
      article: PageWithStoryPackage,
      blocks: Blocks,
      pageType: PageType,
      filterKeyEvents: Boolean,
      forceLive: Boolean,
  )(implicit request: RequestHeader): Future[Result] = {
    implicit val ec = ExecutionContext.global
    Future(
      Cached(article)(RevalidatableResult.Ok(Html("FakeRemoteRender has found you out if you rely on this markup!"))),
    )
  }

  override def getFilters(
      ws: WSClient,
      liveblogId: String,
      timeout: Duration = 60.seconds,
  )(implicit request: RequestHeader): Future[Option[FilterData]] = {
    Future.successful(None)
  }

  override def getBlocks(ws: WSClient, page: LiveBlogPage, blocks: Seq[Block])(implicit
      request: RequestHeader,
  ): Future[String] = {
    Future.successful("FakeRemoteRender has found you out if you rely on this markup!")
  }
}
