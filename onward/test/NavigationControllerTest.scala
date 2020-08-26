package test

import controllers.NavigationController
import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover class NavigationControllerTest
    extends FlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestContentApiClient
    with WithTestApplicationContext {

  lazy val navigationController = new NavigationController(play.api.test.Helpers.stubControllerComponents())
  val testRoute = "/editionalised-nav.json"

  "Navigation Controller" should "serve JSON" in {
    val fakeRequest = FakeRequest(GET, testRoute)
      .withHeaders("host" -> "http://localhost:9000")

    val Some(result) = route(app, fakeRequest)

    status(result) should be(200)
    contentType(result).get should be("application/json")
  }

  it should "start the JSON with items which is mandatory for AMP" in {
    val fakeRequest = FakeRequest(GET, testRoute)
      .withHeaders("host" -> "http://localhost:9000")

    val Some(result) = route(app, fakeRequest)

    contentAsString(result) should startWith("{\"items\"")
  }

  it should "contain the 5 primary sections" in {
    val fakeRequest = FakeRequest(GET, testRoute)
      .withHeaders("host" -> "http://localhost:9000")

    val Some(result) = route(app, fakeRequest)

    contentAsString(result) should include("\"News\"")
    contentAsString(result) should include("\"Opinion\"")
    contentAsString(result) should include("\"Sport\"")
    contentAsString(result) should include("\"Culture\"")
    contentAsString(result) should include("\"Lifestyle\"")
  }
}
