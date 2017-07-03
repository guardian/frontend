package model.structuredData

import model.{Article, Canonical, Content, ContentType, LiveBlogHelpers}
import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.ws.WSClient
import test._
import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import play.api.libs.json.{JsObject, JsValue}
import play.api.libs.ws._
import play.api.libs.ws.ahc.AhcWSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Await, Future}
import scala.concurrent.duration._
import scala.language.postfixOps

class BlogPostingTest extends FlatSpec with Matchers with WithTestContentApiClient {

  def getArticle(url: String): Future[Article] = {

    // Given capi ID, retrieve an Article instance
    // TODO: This should only attempt to get it from local data, it should never actually go to capi.

    val query = testContentApiClient.item(url)
      .showTags("all")
      .showFields("all")
      .showReferences("all")
      .showAtoms("all")
      .showBlocks(Canonical.query.map(_.mkString(",")))

    testContentApiClient.getResponse(query).map(response => {
      Article.make(Content.make(response.content.get))
    })

  }

  "BlogPosting" should "retrieve a headline from the block" in {

    val url = "sport/live/2017/jun/29/australia-v-sri-lanka-womens-cricket-world-cup-live"

    val article = getArticle(url).map(article => {
      val liveBlog = LiveBlogHelpers.createLiveBlogModel(article, Canonical).get
      val posting: JsValue = BlogPosting(article, liveBlog.currentPage.blocks.head)(TestRequest("url"))
      (posting \ "articleBody").as[String] should not be ""
    })

    Await.result(article, 5000 millis)

  }

  "BlogPosting" should "fall back to the headline if the articleBody was empty" in {

    val url = "sport/live/2017/jun/29/australia-v-sri-lanka-womens-cricket-world-cup-live"

    val article = getArticle(url).map(article => {

      val liveBlog = LiveBlogHelpers.createLiveBlogModel(article, Canonical).get

      liveBlog.currentPage.blocks.foreach((b) => {
        val posting: JsValue = BlogPosting(article, b)(TestRequest("url"))
        (posting \ "articleBody").as[String] should not be ""
      })

    })

    Await.result(article, 5000 millis)

  }

  // required for the WithTestContentApiClient to work

  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()
  override def wsClient: WSClient = AhcWSClient()

}
