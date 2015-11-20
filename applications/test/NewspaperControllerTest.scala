package services

import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._
import test.{ConfiguredTestSuite, TestRequest, SingleServerSuite}

@DoNotDiscover class NewspaperControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "Newspaper Controller" should "redirect to /theguardian for date in the future" in {
    val result = controllers.NewspaperController.forDate("01", "jan", "3000")(TestRequest())
    status(result) should be(302)
    header("Location", result).head should be ("/theguardian")
  }

 it should "return 200 to dated page for /theguardian (in the past)" in {
    val result = controllers.NewspaperController.forDate("01", "jan", "2015")(TestRequest("/theguardian/2015/jan/01"))
    status(result) should be(200)
  }

  it should "redirect dated page with /all to the dated page" in {
    val result = controllers.NewspaperController.allOn("01", "jan", "2015")(TestRequest())
    status(result) should be(301)
    header("Location", result).head should be ("/theguardian/2015/jan/01")
  }
}
