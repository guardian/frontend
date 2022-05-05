package test

import controllers.RelatedController
import feed.MostReadAgent
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import services.OphanApi

@DoNotDiscover class RelatedControllerTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestContentApiClient
    with WithTestApplicationContext {

  val article = "uk/2012/aug/07/woman-torture-burglary-waterboard-surrey"
  val badArticle = "i/am/not/here"
  val articleWithoutRelated = "childrens-books-site/2016/may/17/picasso-ed-vere"

  lazy val relatedController = new RelatedController(
    testContentApiClient,
    new MostReadAgent(new OphanApi(wsClient)),
    play.api.test.Helpers.stubControllerComponents(),
  )

  it should "serve JSON when .json format is supplied" in {
    val fakeRequest = FakeRequest(GET, s"/related/$article.json")
      .withHeaders("host" -> "http://localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val Some(result) = route(app, fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

  it should "404 when article does not exist" in {
    val result = relatedController.render(badArticle)(TestRequest())
    status(result) should be(404)
  }

  it should "404 when article does not have related content" in {
    val result = relatedController.render(articleWithoutRelated)(TestRequest())
    status(result) should be(404)
  }
}
