package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import play.api.test.Helpers._
import play.api.test.{ FakeHeaders, FakeRequest }
import play.api.mvc.AnyContentAsEmpty

class SocialCountControllerTest extends FlatSpec with ShouldMatchers {

  implicit val request = new FakeRequest("GET", "http://localhost:9000", FakeHeaders(), AnyContentAsEmpty) {
    override lazy val queryString = Map("callback" -> Seq("counts"))
  }

  "Social Count Controller" should "not proxy share counts for the entire internet" in Fake {
    val result = controllers.SocialCountController.render("http://someoneelse.com")(request)
    status(result) should be(403)
  }

  it should "provide share counts for guardian.co.uk" in {
    Fake {
      val result = controllers.SocialCountController.render("http://www.guardian.co.uk/commentisfree?")(request)

      status(result) should be(200)

      val body = contentAsString(result)

      body.matches(""".*"facebook":\{"count":[0-9]+\}.*""") should be(true)
      body.matches(""".*"twitter":\{"count":[0-9]+\}.*""") should be(true)
    }
  }

  it should "provide share counts for guardiannews.com" in {
    Fake {
      val result = controllers.SocialCountController.render("http://www.guardiannews.com/commentisfree?")(request)

      status(result) should be(200)

      val body = contentAsString(result)

      body.matches(""".*"facebook":\{"count":[0-9]+\}.*""") should be(true)
      body.matches(""".*"twitter":\{"count":[0-9]+\}.*""") should be(true)
    }
  }
}