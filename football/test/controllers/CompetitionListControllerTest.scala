package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class CompetitionListControllerTest extends FlatSpec with ShouldMatchers {
  
  "Competition List Controller" should "200 when content type is competition list" in Fake {
    val result = controllers.CompetitionListController.render()(TestRequest())
    status(result) should be(200)
  }

  it should "return JSONP when callback is supplied" in Fake {
    val fakeRequest = FakeRequest(GET, "/football/competitions?callback=foo").withHeaders("host" -> "localhost:9000")
    val result = controllers.CompetitionListController.render()(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/javascript")
  }
  
}