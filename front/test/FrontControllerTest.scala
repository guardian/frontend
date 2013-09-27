package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import conf.Switches

class FrontControllerTest extends FlatSpec with ShouldMatchers {
  
  val articleUrl = "/environment/2012/feb/22/capitalise-low-carbon-future"
  val callbackName = "aFunction"

  val responsiveRequest = FakeRequest().withHeaders("host" -> "www.theguardian.com")

  "Front Controller" should "200 when content type is front" in Fake {
    val result = controllers.FrontController.renderEditionFront("uk")(TestRequest())
    status(result) should be(200)
  }

  it should "redirect base page to edition page if on www.theguardian.com" in Fake {

    val result = controllers.FrontController.renderFront("")(responsiveRequest.withHeaders("X-GU-Edition" -> "US"))
    status(result) should be(303)
    header("Location", result) should be (Some("/us"))

    val result2 = controllers.FrontController.renderFront("culture")(responsiveRequest.withHeaders("X-GU-Edition" -> "AU"))
    status(result2) should be(303)
    header("Location", result2) should be (Some("/au/culture"))

  }

  it should "understand the editionalised network front" in Fake {
    val result2 = controllers.FrontController.renderEditionFront("uk")(TestRequest())
    status(result2) should be(200)
  }

  it should "understand editionalised section fronts" in Fake {
    val result2 = controllers.FrontController.renderEditionSectionFront("uk/culture")(TestRequest())
    status(result2) should be(200)
  }

  it should "return JSONP when callback is supplied to front" in Fake {
    val fakeRequest = FakeRequest(GET, s"?callback=$callbackName")
        .withHeaders("host" -> "localhost:9000")
        
    val result = controllers.FrontController.renderEditionFront("uk")(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""$callbackName({\"html\"""")
  }

  it should "return JSON when .json format is supplied to front" in Fake {
    val fakeRequest = FakeRequest("GET", ".json")
      .withHeaders("Host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")
      
    val result = controllers.FrontController.renderEditionFrontJson("uk")(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
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
    val result = controllers.FrontController.renderFront("australia")(TestRequest())
    status(result) should be(200)
  }

  it should "200 with an X-Accel-Redirect when X-Gu-Facia is true" in Fake {
    Switches.FaciaSwitch.switchOn()
    val fakeRequest = FakeRequest(GET, "/uk/culture")
      .withHeaders("X-Gu-Facia" -> "true")

    val result = controllers.FrontController.renderEditionSectionFront("uk/culture")(fakeRequest)
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (Some("/redirect/facia/uk/culture"))
  }

  it should "200 with an X-Accel-Redirect when X-Gu-Facia is false" in Fake {
    Switches.FaciaSwitch.switchOn()
    val fakeRequest = FakeRequest(GET, "/uk/culture")
      .withHeaders("X-Gu-Facia" -> "false")

    val result = controllers.FrontController.renderEditionSectionFront("uk/culture")(fakeRequest)
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (None)
  }

  it should "completely ignore X-Gu-Facia if FaciaSwitch is off" in Fake {
    Switches.FaciaSwitch.switchOff()
    val fakeRequest = FakeRequest(GET, "/uk/culture")
      .withHeaders("X-Gu-Facia" -> "true")

    val result = controllers.FrontController.renderEditionSectionFront("uk/culture")(fakeRequest)
    status(result) should be(200)
    header("X-Accel-Redirect", result) should be (None)
  }
}
