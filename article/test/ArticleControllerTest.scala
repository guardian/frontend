package test

import com.gu.contentapi.client.model.v1.Blocks
import controllers.{ArticleController, ArticlePage}
import model.Cached.RevalidatableResult
import model.dotcomponents.PageType
import model.{ApplicationContext, Cached, PageWithStoryPackage}
import org.apache.commons.codec.digest.DigestUtils
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result}
import play.api.test.Helpers._
import play.api.test._
import play.twirl.api.Html
import services.dotcomponents.{RemoteRender, RenderType}

import scala.collection.JavaConverters._
import scala.concurrent.{ExecutionContext, Future}

// I had trouble getting Mockito to play nicely with how scala is using implicits and consts so I've introduced
// these

class FakeRemoteRender(implicit context: ApplicationContext) extends renderers.RemoteRenderer {
  override def getArticle(
      ws: WSClient,
      path: String,
      article: PageWithStoryPackage,
      blocks: Blocks,
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {
    implicit val ec = ExecutionContext.global
    Future(Cached(article)(RevalidatableResult.Ok(Html("OK"))))
  }
}

@DoNotDiscover class ArticleControllerTest
    extends FlatSpec
    with Matchers
    with ConfiguredTestSuite
    with MockitoSugar
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient {

  val articleUrl = "environment/2012/feb/22/capitalise-low-carbon-future"
  val guuiArticle = "world/2018/sep/13/give-pizza-a-chance-south-koreans-pa-weight-to-thwart-conscription"
  val liveBlogUrl = "global/middle-east-live/2013/sep/09/syria-crisis-russia-kerry-us-live"
  val sudokuUrl = "lifeandstyle/2013/sep/09/sudoku-2599-easy"

  lazy val articleController = new ArticleController(
    testContentApiClient,
    play.api.test.Helpers.stubControllerComponents(),
    wsClient,
  )

  lazy val guuiController = new ArticleController(
    testContentApiClient,
    play.api.test.Helpers.stubControllerComponents(),
    wsClient,
    new FakeRemoteRender(),
  )

  "Article Controller" should "200 when content type is article" in {
    val result = articleController.renderArticle(articleUrl)(TestRequest(articleUrl))
    status(result) should be(200)
  }

  "Article Controller" should "200 for guui articles" in {
    val result = guuiController.renderArticle(guuiArticle)(TestRequest(guuiArticle))
    status(result) should be(200)
  }

  it should "return article headline" in {
    val result = articleController.renderHeadline(articleUrl)(TestRequest(articleUrl))
    status(result) should be(200)
    contentAsString(result) shouldBe "We must capitalise on a low-carbon future | Norman Baker"
  }

  it should "200 when content type is live blog" in {
    val result = articleController.renderArticle(liveBlogUrl)(TestRequest(liveBlogUrl))
    status(result) should be(200)
  }

  it should "count in body links" in {
    val result = articleController.renderArticle(liveBlogUrl)(TestRequest(liveBlogUrl))
    val body = contentAsString(result)
    body should include(""""inBodyInternalLinkCount":38""")
    body should include(""""inBodyExternalLinkCount":42""")
  }

  it should "200 when content type is sudoku" in {
    val result = articleController.renderArticle(sudokuUrl)(TestRequest(sudokuUrl))
    status(result) should be(200)
  }

  it should "not cache 404s" in {
    val result = articleController.renderArticle("oops")(TestRequest())
    status(result) should be(404)
    header("Cache-Control", result).head should be("private, no-store, no-cache")
  }

  it should "redirect for short urls" in {
    val result = articleController.renderArticle("p/39heg")(TestRequest("/p/39heg"))
    status(result) should be(302)
    header("Location", result).head should be("/uk/2012/aug/07/woman-torture-burglary-waterboard-surrey")
  }

  it should "return JSON when .json format is supplied" in {
    val fakeRequest = FakeRequest("GET", s"$articleUrl.json")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = articleController.renderJson(articleUrl)(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"config\"")
  }

  it should "internal redirect unsupported content to classic" in {
    val result = articleController.renderArticle("world/video/2012/feb/10/inside-tibet-heart-protest-video")(
      TestRequest("world/video/2012/feb/10/inside-tibet-heart-protest-video"),
    )
    status(result) should be(200)
    header("X-Accel-Redirect", result).get should be(
      "/applications/world/video/2012/feb/10/inside-tibet-heart-protest-video",
    )
  }

  val expiredArticle = "football/2012/sep/14/zlatan-ibrahimovic-paris-st-germain-toulouse"

  it should "know which backend served the request" in {
    val result = route(
      app,
      TestRequest("/world/2014/sep/24/radical-cleric-islamic-state-release-british-hostage-alan-henning"),
    ).head
    status(result) should be(200)
    header("X-Gu-Backend-App", result).head should be("article")
  }

  it should "infer a Surrogate-Key based on the path" in {

    val expectedSurrogateKey = DigestUtils.md5Hex("/stage/2015/jul/15/alex-edelman-steve-martin-edinburgh-fringe")

    val result = route(app, TestRequest("/stage/2015/jul/15/alex-edelman-steve-martin-edinburgh-fringe?index=7")).head
    header("Surrogate-Key", result).head should be(expectedSurrogateKey)
  }

  "International users" should "be in the International edition" in {
    val request = TestRequest("/world/2014/sep/24/radical-cleric-islamic-state-release-british-hostage-alan-henning")
      .withHeaders(
        "X-GU-Edition" -> "int",
      )
    val result = route(app, request).head
    contentAsString(result) should include("\"edition\":\"INT\"")
  }

  "Interactive articles" should "provide a boot.js script element as a main embed" in goTo(
    "/sport/2015/sep/11/how-women-in-tennis-achieved-equal-pay-us-open",
  ) { browser =>
    import browser._
    $(".media-primary > .element-interactive").attributes("data-interactive").asScala.head should endWith("boot.js")
  }

}
