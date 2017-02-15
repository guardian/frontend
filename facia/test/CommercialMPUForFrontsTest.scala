package test

import com.gu.facia.client.models.{ConfigJson, FrontJson}
import controllers.FaciaControllerImpl
import org.jsoup.Jsoup
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._
import services.ConfigAgent

@DoNotDiscover class CommercialMPUForFrontsTest extends FlatSpec
  with Matchers
  with ConfiguredTestSuite
  with BeforeAndAfterAll
  with WithTestContext
  with WithMaterializer
  with WithTestWsClient {

  override def beforeAll() {
    ConfigAgent.refreshWith(
      ConfigJson(
        fronts = Map("au" -> FrontJson(Nil, None, None, None, None, None, None, None, None, None, None, None, None, None)),
        collections = Map.empty)
    )
  }

  lazy val faciaController = new FaciaControllerImpl(new TestFrontJsonFapi(wsClient))
  val frontWithThrasher = "au"

  it should "insert MPUs into applicable slices, and give them unique IDs" in {
    val result = faciaController.renderFront(frontWithThrasher)(TestRequest(frontWithThrasher))
    val body = Jsoup.parseBodyFragment(contentAsString(result))
    status(result) should be(200)

    val desktopMPUs = body.getElementsByClass("fc-slice__item--mpu-candidate")
    desktopMPUs.size should be (2)
    desktopMPUs.first.toString should include ("dfp-ad--inline1")
    desktopMPUs.last.toString should include ("dfp-ad--inline2")
  }

  it should "insert MPUs for mobile view between sections, and give them unique IDs" in {
    val result = faciaController.renderFront(frontWithThrasher)(TestRequest(frontWithThrasher))
    val body = Jsoup.parseBodyFragment(contentAsString(result))
    status(result) should be(200)

    val mobileMPUs = body.getElementsByClass("fc-container__mpu--mobile")
    mobileMPUs.size should be (6)
    mobileMPUs.first.toString should include ("dfp-ad--top-above-nav--mobile")
    mobileMPUs.last.toString should include ("dfp-ad--inline5--mobile")
  }

  it should "not count the first container, if it is a thrasher on a Network Front, when adding mobile MPUs" in {
    val result = faciaController.renderFront(frontWithThrasher)(TestRequest(frontWithThrasher))
    val body = Jsoup.parseBodyFragment(contentAsString(result))

    val thrasher = body.getElementsByClass("fc-container--first").first
    thrasher.id should be ("australia-header")

    val sectionAfterThrasher = thrasher.nextElementSibling()
    sectionAfterThrasher.hasClass("fc-container__mpu--mobile") should be (false)
  }

  it should "avoid inserting next to commercial containers when adding mobile MPUs" in {
    val result = faciaController.renderFront(frontWithThrasher)(TestRequest(frontWithThrasher))
    val body = Jsoup.parseBodyFragment(contentAsString(result))

    val commercialContainers = body.getElementsByClass("fc-container--commercial")
    commercialContainers.size should be (2)

    commercialContainers.first.nextElementSibling.hasClass("fc-container__mpu--mobile") should be (false)
    commercialContainers.first.previousElementSibling.hasClass("fc-container__mpu--mobile") should be (false)
    commercialContainers.last.previousElementSibling.hasClass("fc-container__mpu--mobile") should be (false)

    if (commercialContainers.last.nextElementSibling != null) {
      commercialContainers.last.nextElementSibling.hasClass("fc-container__mpu--mobile") should be (false)
    } else {
      commercialContainers.last.nextElementSibling should be (null)
    }

  }

}
