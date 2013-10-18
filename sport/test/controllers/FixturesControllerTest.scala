package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.Matchers
import org.scalatest.FlatSpec

class FixturesControllerTest extends FlatSpec with Matchers {
  
  val fixturesUrl = "/football/fixtures"
  val fixtureUrl = "/football/fixtures/2012/oct/20"
  val tag = "premierleague"
  val callbackName = "aFunction" 
  
  "Fixtures Controller" should "200 when content type is fixtures" in Fake {
    val result = football.controllers.FixturesController.render()(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to fixtures" in Fake {
    val fakeRequest = FakeRequest(GET, s"${fixturesUrl}?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")
    
    val result = football.controllers.FixturesController.render()(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""${callbackName}({\"config\"""")
  }

  it should "return JSON when .json format is supplied to fixtures" in Fake {
    val fakeRequest = FakeRequest(GET, s"${fixturesUrl}.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
      
    val result = football.controllers.FixturesController.render()(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json")
    contentAsString(result) should startWith("{\"config\"")
  }
  
  it should "200 when content type is tag fixtures" in Fake {
    val result = football.controllers.FixturesController.renderTag(tag)(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to tag fixtures" in Fake {
    val fakeRequest = FakeRequest(GET, s"/football/${tag}/fixtures?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")
      
    val result = football.controllers.FixturesController.renderTag(tag)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""${callbackName}({\"config\"""")
  }

  it should "return JSON when .json format is supplied to tag fixtures" in Fake {
    val fakeRequest = FakeRequest(GET, s"/football/${tag}/fixtures.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
      
    val result = football.controllers.FixturesController.renderTag(tag)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json")
    contentAsString(result) should startWith("{\"config\"")
  }
  
  it should "200 when content type is for fixtures" in Fake {
    val result = football.controllers.FixturesController.renderFor("2012", "oct", "20")(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to for fixtures" in Fake {
    val fakeRequest = FakeRequest(GET, s"${fixtureUrl}?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")
      
    val result = football.controllers.FixturesController.renderFor("2012", "oct", "20")(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""${callbackName}({\"config\"""")
  }

  it should "return JSONP when .json format is supplied to for fixtures" in Fake {
    val fakeRequest = FakeRequest(GET, s"${fixtureUrl}.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
      
    val result = football.controllers.FixturesController.renderFor("2012", "oct", "20")(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json")
    contentAsString(result) should startWith("{\"config\"")
  }
  
}