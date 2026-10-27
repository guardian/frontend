package frontpress

import com.gu.contentapi.client.ContentApiClient
import com.gu.contentapi.client.model.{HttpResponse, SearchQuery}
import com.gu.facia.api.models.LatestSnap
import com.gu.facia.client.models.{
  CustomSubnav,
  CustomSubnavConfig,
  CustomSubnavFormat,
  CustomSubnavHeader,
  SupportingItem,
  SupportingItemMetaData,
  Trail,
  TrailMetaData,
}
import model.pressed.PressedDisplaySettings
import org.joda.time.DateTime
import org.scalatest.flatspec._
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.Json

import scala.concurrent.{ExecutionContext, Future}

class FaciaClientTest extends AsyncFlatSpec with Matchers with MockitoSugar {

  "FAPI card metadata" should "expose mini-nav settings on trails and supporting items" in {
    val json = Json.obj("showMiniNav" -> true, "miniNavId" -> "test-subnav")
    val trailMeta = json.as[TrailMetaData]
    val supportingMeta = json.as[SupportingItemMetaData]
    val subnav = CustomSubnav(
      id = "test-subnav",
      header = CustomSubnavHeader(headerText = "Subnav", dotcomPath = None, copy = "Subnav copy"),
      format = CustomSubnavFormat.Large,
      links = Nil,
      pages = Nil,
      images = None,
      palette = None,
      lastUpdated = new DateTime(),
      updatedBy = "editor",
      updatedEmail = "editor@example.com",
    )
    val subnavConfig = CustomSubnavConfig(live = List(subnav), draft = Nil)

    trailMeta.showMiniNav shouldBe Some(true)
    trailMeta.miniNavId shouldBe Some("test-subnav")
    supportingMeta.showMiniNav shouldBe Some(true)
    supportingMeta.miniNavId shouldBe Some("test-subnav")

    val trail = Trail("snap/test", 0L, None, Some(trailMeta), None)
    val trailSnap = LatestSnap.fromTrailAndContent(trail, None, Some(subnavConfig))
    trailSnap.showMiniNav shouldBe true
    trailSnap.miniNavData shouldBe Some(subnav)

    val supportingItem = SupportingItem("snap/test", None, None, Some(supportingMeta), None)
    val supportingSnap =
      LatestSnap.fromSupportingItemAndContent(supportingItem, None, Some(subnavConfig))
    supportingSnap.showMiniNav shouldBe true
    supportingSnap.miniNavData shouldBe Some(subnav)

    val display = PressedDisplaySettings.make(trailSnap, None)
    display.showMiniNav shouldBe true
    display.miniNavData shouldBe Some(subnav)
    val displayJson = Json.toJson(display)(model.PressedContentFormat.pressedDisplaySettings)
    (displayJson \ "showMiniNav").as[Boolean] shouldBe true
    (displayJson \ "miniNavData" \ "id").as[String] shouldBe subnav.id

    val legacyDisplayJson =
      displayJson.as[play.api.libs.json.JsObject] - "showMiniNav" - "miniNavData"
    val legacyDisplay =
      legacyDisplayJson.as[PressedDisplaySettings](model.PressedContentFormat.pressedDisplaySettings)
    legacyDisplay.showMiniNav shouldBe false
    legacyDisplay.miniNavData shouldBe None
  }

  it should "support existing cards without mini-nav settings" in {
    val meta = Json.obj().as[TrailMetaData]
    val trail = Trail("snap/test", 0L, None, Some(meta), None)
    val content = LatestSnap.fromTrailAndContent(trail, None)

    meta.showMiniNav shouldBe None
    meta.miniNavId shouldBe None
    content.showMiniNav shouldBe false
    content.miniNavData shouldBe None
    val display = PressedDisplaySettings.make(content, None)
    display.isBoosted shouldBe false
    display.showMiniNav shouldBe false
    display.miniNavData shouldBe None
  }

  "FAPI Client" should "send a CAPI client request without a runtime error like java.lang.NoSuchMethodError" in {
    // The FAPI client uses the Content API client. If this test fails with a java.lang.NoSuchMethodError, the
    // versions of FAPI client and CAPI client we are using are incompatible - the FAPI client will have been
    // compiled against a different version of the CAPI client.

    val stubContentApiClient = new ContentApiClient {
      override def apiKey: String = ""
      override def get(url: String, headers: Map[String, String])(implicit
          context: ExecutionContext,
      ): Future[HttpResponse] =
        Future.successful(HttpResponse(Array.empty, 500, ""))
    }

    // This is only exercising the code to send the request, not recieve the result, but it's enough to trigger the
    // java.lang.NoSuchMethodError seen in https://github.com/guardian/frontend/pull/25139#issuecomment-1163407402
    noException shouldBe thrownBy(
      com.gu.facia.api.contentapi.ContentApi.getHydrateResponse(
        stubContentApiClient,
        Seq(
          SearchQuery().tag("profile/roberto-tyley"),
          SearchQuery().tag("stage/comedy"),
        ),
      ),
    )
  }

}
