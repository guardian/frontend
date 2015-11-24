package services

import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._
import test.{ConfiguredTestSuite, TestRequest, SingleServerSuite}

@DoNotDiscover class NewspaperControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "Newspaper Controller" should "redirect to /theguardian for date in the future" in {
    val result = controllers.NewspaperController.newspaperForDate("theguardian", "01", "jan", "3000")(TestRequest())
    status(result) should be(302)
    header("Location", result).head should be("/theguardian")
  }

  it should "return 200 to dated page for /theguardian (in the past)" in {
    val result = controllers.NewspaperController.newspaperForDate("theguardian", "01", "jan", "2015")(TestRequest("/theguardian/2015/jan/01"))
    status(result) should be(200)
  }

  it should "return 200 to dated page for a Sunday date /theobserver (in the past)" in {
    val result = controllers.NewspaperController.newspaperForDate("theobserver", "08", "nov", "2015")(TestRequest("/theobserver/2015/nov/08"))
    status(result) should be(200)
  }

  it should "redirect dated page with /all to the dated page for" in {
    val result = controllers.NewspaperController.allOn("theguardian", "01", "jan", "2015")(TestRequest())
    status(result) should be(301)
    header("Location", result).head should be ("/theguardian/2015/jan/01")
  }

  it should "redirect a non Sunday Observer date url to /theobserver" in {
    val result = controllers.NewspaperController.newspaperForDate("theobserver", "19", "nov", "2015")(TestRequest("/theguardian/2015/nov/19"))
    status(result) should be(302)
    header("Location", result).head should be("/theobserver")
  }


  it should "redirect a Sunday Guardian date url to /theguardian" in {
    val result = controllers.NewspaperController.newspaperForDate("theguardian", "08", "nov", "2015")(TestRequest("/theguardian/2015/nov/08"))
    status(result) should be(302)
    header("Location", result).head should be("/theguardian")
  }

}
