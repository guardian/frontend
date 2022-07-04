package test

import com.gu.contentapi.client.model.v1.{Block, Blocks}
import model.Cached.RevalidatableResult
import model.dotcomrendering.PageType
import model.{ApplicationContext, Cached, LiveBlogPage, PageWithStoryPackage, Topic}
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result}
import play.twirl.api.Html

import scala.collection.mutable.{Queue, ArrayBuffer}
import scala.concurrent.{ExecutionContext, Future}

// It is always a mistake to rely on actual DCR output for tests.
class DCRFake(implicit context: ApplicationContext) extends renderers.DotcomRenderingService {

  val requestedBlogs: Queue[PageWithStoryPackage] = new Queue[PageWithStoryPackage]()
  val updatedBlocks = ArrayBuffer.empty[Block]

  override def getArticle(
      ws: WSClient,
      article: PageWithStoryPackage,
      blocks: Blocks,
      pageType: PageType,
      filterKeyEvents: Boolean,
      forceLive: Boolean,
      availableTopics: Option[Seq[Topic]],
      selectedTopics: Option[String],
  )(implicit request: RequestHeader): Future[Result] = {
    implicit val ec = ExecutionContext.global
    requestedBlogs.enqueue(article)
    Future(
      Cached(article)(RevalidatableResult.Ok(Html("FakeRemoteRender has found you out if you rely on this markup!"))),
    )
  }

  override def getBlocks(ws: WSClient, page: LiveBlogPage, blocks: Seq[Block])(implicit
      request: RequestHeader,
  ): Future[String] = {
    updatedBlocks ++= blocks
    Future.successful("FakeRemoteRender has found you out if you rely on this markup!")
  }
}
