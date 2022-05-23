package views.support.cleaner

import org.scalatest.matchers.should.Matchers
import StringCleaner._
import org.scalatest.flatspec.AnyFlatSpec
import play.api.test.FakeRequest
import views.support.CommercialMPUForFronts

class CommercialMPUForFrontsTest extends AnyFlatSpec with Matchers {

  def getFileContent(filePath: String): String = {
    val source = scala.io.Source.fromInputStream(getClass.getResourceAsStream(filePath))
    try source.mkString
    finally source.close()
  }

  val body = getFileContent("fixtures/CommercialMPUForFronts.html").cleanWith(CommercialMPUForFronts()(FakeRequest()))

  it should "insert MPUs into applicable slices, and give them unique IDs" in {
    val desktopMPUs = body.getElementsByClass("fc-slice__item--mpu-candidate")
    desktopMPUs.size should be(3)
    desktopMPUs.first.toString should include("dfp-ad--inline1")
    desktopMPUs.last.toString should include("dfp-ad--inline3")
  }

  it should "insert MPUs for mobile view between sections, and give them unique IDs" in {
    val mobileMPUs = body.getElementsByClass("fc-container__mpu--mobile")
    mobileMPUs.size should be(2)
    mobileMPUs.first.toString should include("dfp-ad--top-above-nav--mobile")
    mobileMPUs.last.toString should include("dfp-ad--inline1--mobile")
  }

  it should "not count the first container, if it is a thrasher, when adding mobile MPUs" in {
    val thrasher = body.getElementsByClass("fc-container--first").first
    thrasher.id should be("thrasher")

    val sectionAfterThrasher = thrasher.nextElementSibling()
    sectionAfterThrasher.hasClass("fc-container__mpu--mobile") should be(false)
  }

  it should "avoid inserting next to commercial containers when adding mobile MPUs" in {
    val commercialContainers = body.getElementsByClass("fc-container--commercial")
    commercialContainers.size should be(2)

    commercialContainers.first.nextElementSibling.hasClass("fc-container__mpu--mobile") should be(false)
    commercialContainers.first.previousElementSibling.hasClass("fc-container__mpu--mobile") should be(false)
    commercialContainers.last.previousElementSibling.hasClass("fc-container__mpu--mobile") should be(false)
    commercialContainers.last.nextElementSibling should be(null)
  }

}
