package controllers.commercial

import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import test.{Fake, TestRequest}

class SimpleAdvertTest extends FlatSpec with ShouldMatchers {
  
  val advertUrl = "jobs"

  "Simple Advert Controller" should "200 when an advert is requested" in Fake {
    val result = controllers.commercial.SimpleAdvert.render(advertUrl)(TestRequest())
    status(result) should be(200)
  }

}
