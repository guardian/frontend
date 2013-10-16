package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec

class SimpleAdvertTest extends FlatSpec with ShouldMatchers {
  
  val advertUrl = "/commercial/jobs"

  "Simple Advert Controller" should "200 when an advert is requested" in Fake {
    val result = controllers.commercial.SimpleAdvert.render(advertUrl)(TestRequest())
    status(result) should be(200)
  }

}
