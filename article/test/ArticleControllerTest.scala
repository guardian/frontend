package test

import agents.DeeplyReadAgent
import controllers.ArticleController
import org.apache.commons.codec.digest.DigestUtils
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatestplus.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.matchers.should.Matchers
import play.api.test.Helpers._
import play.api.test._
import services.NewsletterService
import services.dotcomrendering.OnwardsPicker
import services.newsletters.{NewsletterApi, NewsletterSignupAgent}
import agents.CuratedContentAgent

@DoNotDiscover class ArticleControllerTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with MockitoSugar
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient
    with WithTestFrontJsonFapi {

  val articleUrl = "environment/2012/feb/22/capitalise-low-carbon-future"
  val liveBlogUrl = "global/middle-east-live/2013/sep/09/syria-crisis-russia-kerry-us-live"

  lazy val curatedContentAgent = new CuratedContentAgent(fapi)

  lazy val articleController = new ArticleController(
    testContentApiClient,
    play.api.test.Helpers.stubControllerComponents(),
    wsClient,
    new DCRFake(),
    new NewsletterService(new NewsletterSignupAgent(new NewsletterApi(wsClient))),
    new DeeplyReadAgent(),
    new OnwardsPicker(curatedContentAgent),
    curatedContentAgent,
  )

  "Article Controller" should "200 when content type is article" in {
    val result = articleController.renderArticle(articleUrl)(TestRequest(articleUrl))
    status(result) should be(200)
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
}
