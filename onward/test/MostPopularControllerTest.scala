package test

import controllers.MostPopularController
import feed.{DayMostPopularAgent, GeoMostPopularAgent, MostPopularAgent}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import play.api.test._
import play.api.test.Helpers._
import services.OphanApi
import agents.DeeplyReadAgent

@DoNotDiscover class MostPopularControllerTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestApplicationContext
    with WithTestContentApiClient {

  val tag = "technology"

  lazy val ophanApi = new OphanApi(wsClient)
  lazy val mostPopularController = new MostPopularController(
    testContentApiClient,
    new GeoMostPopularAgent(testContentApiClient, ophanApi),
    new DayMostPopularAgent(testContentApiClient, ophanApi),
    new MostPopularAgent(testContentApiClient, ophanApi, wsClient),
    new DeeplyReadAgent,
    play.api.test.Helpers.stubControllerComponents(),
  )

  "Most Popular Controller" should "200 when content type is tag" in {
    val result = mostPopularController.render(tag)(TestRequest())
    status(result) should be(200)
  }

  it should "return JSON when .json format is supplied" in {
    val fakeRequest = FakeRequest(GET, s"/most-read/$tag.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = mostPopularController.render(tag)(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

}
