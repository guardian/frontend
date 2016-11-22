package test

import commercial.controllers.HostedContentController
import org.scalatest.DoNotDiscover
import play.api.mvc._
import play.api.test.Helpers._
import play.api.test._

@DoNotDiscover class CommercialAmpValidityTest extends AmpValidityTest with WithTestContentApiClient {

  override protected def getContentString[T](path: String)(block: (String) => T): T = {
    val controller = new HostedContentController(testContentApiClient)
    val pathParts = path.split('?').head.split('/').drop(1)
    val campaign = pathParts.head
    val page = pathParts.last
    val request = FakeRequest("GET", s"$path=1", FakeHeaders(), AnyContentAsEmpty)
    val result = controller.renderHostedPage(campaign, page).apply(request)
    val bodyText = contentAsString(result)
    block(bodyText)
  }

  val hostedArticleId = "advertiser-content/audi-history-of-audi/audi-and-innovation"
  testAmpPageValidity(hostedArticleId)
}
