package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class FrontControllerTest extends FlatSpec with ShouldMatchers {
  
  val articleUrl = "/environment/2012/feb/22/capitalise-low-carbon-future"
  val callbackName = "aFunction"

  val mobileRequest = FakeRequest().withHeaders("host" -> "m.guardian.co.uk")
  val responsiveRequest = FakeRequest().withHeaders("host" -> "www.theguardian.com")

  "Front Controller" should "200 when content type is front" in Fake {
    val result = controllers.FrontController.render("")(TestRequest())
    status(result) should be(200)
  }

  it should "redirect base page to edition page if on www.theguardian.com" in Fake {

    val result = controllers.FrontController.render("")(responsiveRequest.withHeaders("X-GU-Edition" -> "US"))
    status(result) should be(303)
    header("Location", result) should be (Some("/us"))

    val result2 = controllers.FrontController.render("culture")(responsiveRequest.withHeaders("X-GU-Edition" -> "AU"))
    status(result2) should be(303)
    header("Location", result2) should be (Some("/au/culture"))

  }

  it should "NOT redirect base page to edition page if on m.guardian.co.uk" in Fake {

    val result = controllers.FrontController.render("")(mobileRequest.withHeaders("X-GU-Edition" -> "US"))
    status(result) should be(200)

    val result2 = controllers.FrontController.render("culture")(mobileRequest.withHeaders("X-GU-Edition" -> "AU"))
    status(result2) should be(200)
  }

  it should "understand the editionalised network front" in Fake {
    val result = controllers.FrontController.render("uk-edition")(TestRequest())
    status(result) should be(200)

    val result2 = controllers.FrontController.render("uk")(TestRequest())
    status(result2) should be(200)
  }

  it should "understand editionalised section fronts" in Fake {
    val result = controllers.FrontController.render("culture/uk-edition")(TestRequest())
    status(result) should be(200)

    val result2 = controllers.FrontController.render("uk/culture")(TestRequest())
    status(result2) should be(200)
  }

  it should "return JSONP when callback is supplied to front" in Fake {
    val fakeRequest = FakeRequest(GET, s"?callback=$callbackName")
        .withHeaders("host" -> "localhost:9000")
        
    val result = controllers.FrontController.render("")(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""$callbackName({\"config\"""")
  }

  it should "return JSON when .json format is supplied to front" in Fake {
    val fakeRequest = FakeRequest("GET", ".json")
      .withHeaders("Host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
      
    val result = controllers.FrontController.render("")(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"config\"")
  }

  it should "200 when content type is front trails" in Fake {
    val result = controllers.FrontController.renderTrails("")(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied to front trails" in Fake {
    val fakeRequest = FakeRequest(GET, s"/culture/trails?callback=$callbackName")
        .withHeaders("host" -> "localhost:9000")
        
    val result = controllers.FrontController.renderTrails("")(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""$callbackName({\"html\"""")
  }

  it should "return JSON when .json format is supplied to front trails" in Fake {
    val fakeRequest = FakeRequest("GET", "/culture/trails.json")
      .withHeaders("Host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
      
    val result = controllers.FrontController.renderTrails("")(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

  it should "200 for australia" in Fake {
    val result = controllers.FrontController.render("australia")(TestRequest())
    status(result) should be(200)
  }

}
