package test

import commercial.controllers.HostedContentController
import org.scalatest.DoNotDiscover
import play.api.mvc._
import play.api.test.Helpers._
import play.api.test._

@DoNotDiscover class CommercialAmpValidityTest extends AmpValidityTest
  with WithTestEnvironment
  with WithTestContentApiClient {

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

  val hostedArticleWithVideoId = "advertiser-content/chester-zoo-act-for-wildlife/ensuring-a-future-for-south-asian-wildlife"
  testAmpPageValidity(hostedArticleWithVideoId)

  val hostedVideoId = "advertiser-content/chester-zoo-act-for-wildlife/making-wildlife-friendly-habitats"
  testAmpPageValidity(hostedVideoId)

  val hostedYoutubeId = "advertiser-content/explore-canada-food-busker-in-canada/duelling-bagels"
  testAmpPageValidity(hostedYoutubeId)

  val hostedGalleryId = "advertiser-content/john-lewis-curtains-and-blinds/curtains-blinds"
  testAmpPageValidity(hostedGalleryId)
}
