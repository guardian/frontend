package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.{BeforeAndAfterAll, FlatSpec}
import common.{AkkaAsync, FrontMetrics, Jobs}
import controllers.front.Front
import concurrent.duration._

class FaciaControllerTest extends FlatSpec with ShouldMatchers with BeforeAndAfterAll {

  val articleUrl = "/environment/2012/feb/22/capitalise-low-carbon-future"
  val callbackName = "aFunction"

  val responsiveRequest = FakeRequest().withHeaders("host" -> "www.theguardian.com")

  override def beforeAll() = {
    /*running(FakeApplication()) {
      Jobs.deschedule("FrontRefreshJob")
      Jobs.schedule("FrontRefreshJob", "0 * * * * ?", FrontMetrics.FrontLoadTimingMetric) {
        // stagger refresh jobs to avoid dogpiling the api
        Front.refreshJobs().zipWithIndex.foreach{ case (job, index) =>
          val sec = (index * 2) % 60
          AkkaAsync.after(sec.seconds){
            job()
          }
        }
      }

      Front.refresh()

      val start = System.currentTimeMillis

      //Our tests use things from uk, us and au. Lets wait for these three fronts (60 seconds)
      while (!Front.hasItems("uk") || !Front.hasItems("us") || !Front.hasItems("au")) {
        // ensure we don't get in an endless loop if test data changes
        if (System.currentTimeMillis - start > 2.minutes.toMillis) throw new RuntimeException("front should have loaded by now")
      }
    }*/
  }

  override def afterAll() = {
    //Jobs.deschedule("FrontsRefreshJob")
  }

  ignore should "200 when content type is front" in Fake {
    val result = controllers.FaciaController.renderEditionFront("uk")(TestRequest())
    status(result) should be(200)
  }

  ignore should "redirect base page to edition page if on www.theguardian.com" in Fake {

    val result = controllers.FaciaController.renderFront("")(responsiveRequest.withHeaders("X-GU-Edition" -> "US"))
    status(result) should be(303)
    header("Location", result) should be (Some("/us"))

    val result2 = controllers.FaciaController.renderFront("culture")(responsiveRequest.withHeaders("X-GU-Edition" -> "AU"))
    status(result2) should be(303)
    header("Location", result2) should be (Some("/au/culture"))

  }

  ignore should "understand the editionalised network front" in Fake {
    val result2 = controllers.FaciaController.renderEditionFront("uk")(TestRequest())
    status(result2) should be(200)
  }

  ignore should "understand editionalised section fronts" in Fake {
    val result2 = controllers.FaciaController.renderEditionSectionFront("uk/culture")(TestRequest())
    status(result2) should be(200)
  }

  ignore should "return JSONP when callback is supplied to front" in Fake {
    val fakeRequest = FakeRequest(GET, s"?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")

    val result = controllers.FaciaController.renderEditionFront("uk")(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""$callbackName({\"html\"""")
  }

  ignore should "return JSON when .json format is supplied to front" in Fake {
    val fakeRequest = FakeRequest("GET", ".json")
      .withHeaders("Host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.FaciaController.renderEditionFrontJson("uk")(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

  ignore should "200 when content type is front trails" in Fake {
    //Fronts never redirected, this redirects if you hignore naked slash
    val result = controllers.FaciaController.renderTrails("")(TestRequest())
    status(result) should be(303)

    val result2 = controllers.FaciaController.renderTrails("uk")(TestRequest())
    status(result2) should be(200)
  }

  ignore should "return JSONP when callback is supplied to front trails" in Fake {
    val fakeRequest = FakeRequest(GET, s"/culture/trails?callback=$callbackName")
      .withHeaders("host" -> "localhost:9000")

    val result = controllers.FaciaController.renderTrails("uk")(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/javascript")
    contentAsString(result) should startWith(s"""$callbackName({\"html\"""")
  }

  ignore should "return JSON when .json format is supplied to front trails" in Fake {
    val fakeRequest = FakeRequest("GET", "/culture/trails.json")
      .withHeaders("Host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.FaciaController.renderTrails("uk")(fakeRequest)
    status(result) should be(200)
    contentType(result).get should be("application/json")
    contentAsString(result) should startWith("{\"html\"")
  }

  ignore should "200 when hitting the front" in Fake {
    val result = controllers.FaciaController.renderEditionFront("uk")(TestRequest())
    status(result) should be(200)
  }
}
