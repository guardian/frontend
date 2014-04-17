package test

import org.scalatest.{Matchers, FlatSpec}
import play.api.test.Helpers._

class AllIndexControllerTest extends FlatSpec with Matchers {

  private val PermanentRedirect = 301
  private val TemporaryRedirect = 302

  it should "redirect dated tag pages to the equivalent /all page" in Fake {
    val result = controllers.AllIndexController.on("football/series/thefiver/2014/jan/23")(TestRequest())
    status(result) should be(PermanentRedirect)
    header("Location", result).head should endWith ("/football/series/thefiver/2014/jan/23/all")
  }

  it should "redirect dated section pages to the equivalent /all page" in Fake {
    val result = controllers.AllIndexController.on("football/2014/jan/23")(TestRequest())
    status(result) should be(PermanentRedirect)
    header("Location", result).head should endWith ("/football/2014/jan/23/all")
  }

  it should "redirect to the first earlier page for the given date" in Fake {
    val result = controllers.AllIndexController.newer("sport/cycling", "25", "dec", "2013")(TestRequest())
    status(result) should be(TemporaryRedirect)
    header("Location", result).head should endWith ("/sport/cycling/2013/dec/26/all")
  }

  it should "redirect to the first older page for the date" in Fake {
    val result = controllers.AllIndexController.allOn("sport/cycling", "25", "dec", "2013")(TestRequest())
    status(result) should be(TemporaryRedirect)
    header("Location", result).head should endWith ("/sport/cycling/2013/dec/23/all")
  }

}
