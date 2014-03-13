package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest._

class FixturesControllerTest extends FreeSpec with ShouldMatchers {
  
  val fixturesUrl = "/football/fixtures"
  val fixtureForUrl = "/football/fixtures/2012/oct/20"
  val tag = "premierleague"
  val callbackName = "aFunction"

  "can load the all fixtures page" in Fake {
    val result = football.controllers.FixturesController.allFixtures()(TestRequest())
    status(result) should be(200)
  }

  "should return JSONP for all fixtures with JSONP callback parameter provided" in Fake {
    val fakeRequest = FakeRequest(GET, s"$fixturesUrl.json?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")
    val result = football.controllers.FixturesController.allFixtures()(fakeRequest)

    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript; charset=utf-8")
    contentAsString(result) should startWith(s"""$callbackName({"""")

  }

  "should return basic JSON without callback parameter" in Fake {
    val fakeRequest = FakeRequest(GET, s"$fixturesUrl.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
    val result = football.controllers.FixturesController.allFixtures()(fakeRequest)

    status(result) should be(200)
    header("Content-Type", result).get should be("application/json; charset=utf-8")
    contentAsString(result) should startWith("""{"""")
  }

  "can load fixtures for a given date" in Fake {
    val result = football.controllers.FixturesController.allFixturesFor("2012", "oct", "20")(TestRequest())
    status(result) should be(200)
  }

  "can return JSONP fixtures for a given date" in Fake {
    val fakeRequest = FakeRequest(GET, s"$fixtureForUrl.json?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")
    val result = football.controllers.FixturesController.allFixturesFor("2012", "oct", "20")(fakeRequest)

    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript; charset=utf-8")
    contentAsString(result) should startWith(s"""$callbackName({""")
  }

  "returns normal JSON for .json request without callback" in Fake {
    val fakeRequest = FakeRequest(GET, s"$fixtureForUrl.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
    val result = football.controllers.FixturesController.allFixturesFor("2012", "oct", "20")(fakeRequest)

    status(result) should be(200)
    header("Content-Type", result).get should be("application/json; charset=utf-8")
    contentAsString(result) should startWith("""{"""")
  }

  "can load the tag fixtures page" in Fake {
    val result = football.controllers.FixturesController.tagFixtures(tag)(TestRequest())
    status(result) should be(200)
  }

  "tag fixtures page returns JSONP with callback parameter" in Fake {
    val fakeRequest = FakeRequest(GET, s"/football/$tag/fixtures.json?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")
    val result = football.controllers.FixturesController.tagFixtures(tag)(fakeRequest)

    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript; charset=utf-8")
    contentAsString(result) should startWith(s"""$callbackName({""")
  }

  "should return normal JSON for .json request without callback param" in Fake {
    val fakeRequest = FakeRequest(GET, s"/football/$tag/fixtures.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
    val result = football.controllers.FixturesController.tagFixtures(tag)(fakeRequest)

    status(result) should be(200)
    header("Content-Type", result).get should be("application/json; charset=utf-8")
    contentAsString(result) should startWith("""{"""")
  }

  "can load tag fixtures for a given date" in Fake {
    val result = football.controllers.FixturesController.tagFixturesFor("2012", "oct", "20", tag)(TestRequest())
    status(result) should be(200)
  }

  "can return tag JSONP fixtures for a given date" in Fake {
    val fakeRequest = FakeRequest(GET, s"/football/$tag/fixtures.json?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")
    val result = football.controllers.FixturesController.tagFixturesFor("2012", "oct", "20", tag)(fakeRequest)

    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript; charset=utf-8")
    contentAsString(result) should startWith(s"""$callbackName({"""")
  }

  "returns normal tag JSON for .json request without callback" in Fake {
    val fakeRequest = FakeRequest(GET, s"$fixtureForUrl.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
    val result = football.controllers.FixturesController.tagFixturesFor("2012", "oct", "20", tag)(fakeRequest)

    status(result) should be(200)
    header("Content-Type", result).get should be("application/json; charset=utf-8")
    contentAsString(result) should startWith("""{"""")
  }
}
