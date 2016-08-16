package test

import football.controllers.FixturesController
import play.api.test._
import play.api.test.Helpers._
import org.scalatest._

@DoNotDiscover class FixturesControllerTest
  extends FreeSpec
  with ShouldMatchers
  with FootballTestData {

  val fixturesUrl = "/football/fixtures"
  val fixtureForUrl = "/football/fixtures/2012/oct/20"
  val tag = "premierleague"

  val fixturesController = new FixturesController(testCompetitionsService)

  "can load the all fixtures page" in {
    val result = fixturesController.allFixtures()(TestRequest())
    status(result) should be(200)
  }

  "should return basic JSON without callback parameter" in {
    val fakeRequest = FakeRequest(GET, s"$fixturesUrl.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
    val result = fixturesController.allFixtures()(fakeRequest)

    status(result) should be(200)
    header("Content-Type", result).get should be("application/json; charset=utf-8")
    contentAsString(result) should startWith("""{"""")
  }

  "can load fixtures for a given date" in {
    val result = fixturesController.allFixturesFor("2012", "oct", "20")(TestRequest())
    status(result) should be(200)
  }

  "returns normal JSON for .json request without callback" in {
    val fakeRequest = FakeRequest(GET, s"$fixtureForUrl.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
    val result = fixturesController.allFixturesFor("2012", "oct", "20")(fakeRequest)

    status(result) should be(200)
    header("Content-Type", result).get should be("application/json; charset=utf-8")
    contentAsString(result) should startWith("""{"""")
  }

  "can load the tag fixtures page" in {
    val result = fixturesController.tagFixtures(tag)(TestRequest())
    status(result) should be(200)
  }

  "should return normal JSON for .json request without callback param" in {
    val fakeRequest = FakeRequest(GET, s"/football/$tag/fixtures.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
    val result = fixturesController.tagFixtures(tag)(fakeRequest)

    status(result) should be(200)
    header("Content-Type", result).get should be("application/json; charset=utf-8")
    contentAsString(result) should startWith("""{"""")
  }

  "can load tag fixtures for a given date" in {
    val result = fixturesController.tagFixturesFor("2012", "oct", "20", tag)(TestRequest())
    status(result) should be(200)
  }

  "returns normal tag JSON for .json request without callback" in {
    val fakeRequest = FakeRequest(GET, s"$fixtureForUrl.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
    val result = fixturesController.tagFixturesFor("2012", "oct", "20", tag)(fakeRequest)

    status(result) should be(200)
    header("Content-Type", result).get should be("application/json; charset=utf-8")
    contentAsString(result) should startWith("""{"""")
  }
}
