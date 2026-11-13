package frontpress

import com.gu.contentapi.client.model.v1.{Content => ApiContent, ContentFields}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import com.gu.facia.api.{models => fapi}
import com.gu.facia.api.models.PublicationStatus
import com.gu.facia.api.models.PublicationStatus.{Draft, Live}
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
import common.facia.FixtureBuilder
import model.{ApplicationIdentity, PressedContentFormat}
import model.dotcomrendering.{DotcomFrontsRenderingDataModel, PageType}
import model.pressed.{PressedContent, PressedDisplaySettings}
import org.joda.time.DateTime
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.{JsObject, Json}
import play.api.test.FakeRequest
import services.SubnavAgent

import java.time.OffsetDateTime

class MiniNavContentPressingTest extends AnyFlatSpec with Matchers {
  private val liveSubnav = CustomSubnav(
    id = "test-subnav",
    header = CustomSubnavHeader("Subnav", Some("/test-subnav"), "Subnav copy"),
    format = CustomSubnavFormat.Large,
    links = Nil,
    pages = Nil,
    images = None,
    palette = None,
    lastUpdated = new DateTime(0L),
    updatedBy = "editor",
    updatedEmail = "editor@example.com",
  )
  private val draftSubnav = liveSubnav.copy(updatedBy = "draft editor")
  private val subnavAgent = new SubnavAgent(ApplicationIdentity("facia-press")) {
    override def getSubnavConfig(): Option[CustomSubnavConfig] =
      Some(CustomSubnavConfig(live = List(liveSubnav), draft = List(draftSubnav)))
  }
  private val enabledMeta = Json.obj("showMiniNav" -> true, "miniNavUrl" -> "/test-subnav")

  private def trail(id: String, meta: JsObject = enabledMeta): Trail =
    Trail(id, 0L, None, Some(meta.as[TrailMetaData]), None)

  private def content(id: String): ApiContent =
    ApiContent(
      id = id,
      sectionId = None,
      sectionName = None,
      webPublicationDate = Some(OffsetDateTime.parse("2026-01-01T00:00:00Z").toCapiDateTime),
      webTitle = "Title",
      webUrl = s"https://www.theguardian.com/$id",
      apiUrl = s"https://content.guardianapis.com/$id",
    )

  private def curated(source: Trail, supporting: List[fapi.FaciaContent] = Nil): fapi.CuratedContent =
    fapi.CuratedContent.fromTrailAndContentWithSupporting(
      content(source.id),
      source.safeMeta,
      None,
      supporting,
      fapi.CollectionConfig.empty,
      None,
    )

  private def press(
      items: List[fapi.FaciaContent],
      trails: List[Trail],
      status: PublicationStatus = Live,
      suppressImages: Boolean = false,
  ): List[PressedContent] =
    MiniNavContentPressing.pressContents(items, trails, suppressImages, status, subnavAgent)

  "MiniNavContentPressing" should "resolve a card's mini-nav URL using the pressing publication status" in {
    val source = trail("snap/test")
    val item = fapi.LatestSnap.fromTrailAndContent(source, None)

    press(List(item), List(source)).head.display.miniNavData shouldBe Some(liveSubnav)
    press(List(item), List(source), Draft).head.display.miniNavData shouldBe Some(draftSubnav)
    press(List(item), List(source)).head.display.showMiniNav shouldBe true
  }

  it should "keep existing cards disabled and avoid resolving data for disabled mini-navs" in {
    for (meta <- List(Json.obj(), enabledMeta ++ Json.obj("showMiniNav" -> false))) {
      val source = trail("snap/test", meta)
      val item = fapi.LatestSnap.fromTrailAndContent(source, None)
      val pressed = press(List(item), List(source)).head

      pressed.display.showMiniNav shouldBe false
      pressed.display.miniNavData shouldBe None
    }
  }

  it should "leave mini-nav data absent when the URL is missing or unknown" in {
    for (meta <- List(Json.obj("showMiniNav" -> true), enabledMeta ++ Json.obj("miniNavUrl" -> "/unknown"))) {
      val source = trail("snap/test", meta)
      val item = fapi.LatestSnap.fromTrailAndContent(source, None)
      val pressed = press(List(item), List(source)).head

      pressed.display.showMiniNav shouldBe true
      pressed.display.miniNavData shouldBe None
    }
  }

  it should "match metadata by ID rather than returned content order" in {
    val enabled = trail("sport/enabled")
    val disabled = trail("sport/disabled", Json.obj())
    val pressed = press(List(curated(disabled), curated(enabled)), List(enabled, disabled))

    pressed.map(_.display.showMiniNav) shouldBe List(false, true)
    pressed.map(_.display.miniNavData) shouldBe List(None, Some(liveSubnav))
  }

  it should "match a latest snap by its trail ID rather than the content it resolves to" in {
    val source = trail("snap/latest")
    val item = fapi.LatestSnap.fromTrailAndContent(source, Some(content("sport/latest-article")))

    press(List(item), List(source)).head.display.miniNavData shouldBe Some(liveSubnav)
  }

  it should "match internal-code trails and supporting articles after CAPI resolves their paths" in {
    val editorUrl = s"https://fronts.local.dev-gutools.co.uk/v2/subnavs/${liveSubnav.id}"
    val supportingMeta = Json.obj("showMiniNav" -> true, "miniNavUrl" -> editorUrl)
    val source = trail(
      "internal-code/page/17712690",
      Json.obj(
        "showMiniNav" -> true,
        "miniNavId" -> liveSubnav.id,
        "miniNavUrl" -> "",
        "supporting" -> Json.arr(
          Json.obj("id" -> "internal-code/page/17731294", "meta" -> supportingMeta),
        ),
      ),
    )
    val supporting = fapi.SupportingCuratedContent.fromTrailAndContent(
      content("business/resolved").copy(fields = Some(ContentFields(internalPageCode = Some(17731294)))),
      supportingMeta.as[SupportingItemMetaData],
      None,
      fapi.CollectionConfig.empty,
      None,
    )
    val item = fapi.CuratedContent.fromTrailAndContentWithSupporting(
      content("football/resolved").copy(fields = Some(ContentFields(internalPageCode = Some(17712690)))),
      source.safeMeta,
      None,
      List(supporting),
      fapi.CollectionConfig.empty,
      None,
    )

    for (status <- List(Live, Draft)) {
      val expected = if (status == Draft) draftSubnav else liveSubnav
      val json = PressedContentFormat.format.writes(press(List(item), List(source), status).head)
      (json \ "display" \ "showMiniNav").as[Boolean] shouldBe true
      (json \ "display" \ "miniNavData" \ "updatedBy").as[String] shouldBe expected.updatedBy
      (json \ "supportingContent" \ 0 \ "display" \ "showMiniNav").as[Boolean] shouldBe true
      (json \ "supportingContent" \ 0 \ "display" \ "miniNavData" \ "updatedBy")
        .as[String] shouldBe expected.updatedBy
    }

    val unavailableAgent = new SubnavAgent(ApplicationIdentity("facia-press")) {
      override def getSubnavConfig(): Option[CustomSubnavConfig] = None
    }
    val unresolved = MiniNavContentPressing.pressContents(List(item), List(source), false, Live, unavailableAgent).head
    unresolved.display.showMiniNav shouldBe true
    unresolved.display.miniNavData shouldBe None
  }

  it should "keep supporting-item settings scoped to their parent card" in {
    val supportingMeta = enabledMeta.as[SupportingItemMetaData]
    val supportingItem = SupportingItem("snap/supporting", None, None, Some(supportingMeta), None)
    val supportingSnap = fapi.LatestSnap.fromSupportingItemAndContent(supportingItem, None)
    val supportingArticle = fapi.SupportingCuratedContent.fromTrailAndContent(
      content("sport/supporting"),
      supportingMeta,
      None,
      fapi.CollectionConfig.empty,
      None,
    )
    val source = trail(
      "sport/parent",
      Json.obj(
        "supporting" -> Json.arr(
          Json.obj("id" -> "snap/supporting", "meta" -> enabledMeta),
          Json.obj("id" -> "sport/supporting", "meta" -> enabledMeta),
        ),
      ),
    )
    val otherParent = trail(
      "sport/other-parent",
      enabledMeta ++ Json.obj("supporting" -> Json.arr(Json.obj("id" -> "snap/supporting"))),
    )
    val pressed = press(
      List(curated(source, List(supportingSnap, supportingArticle)), curated(otherParent, List(supportingSnap))),
      List(source, otherParent),
    )
    val json = pressed.map(PressedContentFormat.format.writes)

    (json.head \ "display" \ "showMiniNav").as[Boolean] shouldBe false
    val supporting = (json.head \ "supportingContent").as[List[JsObject]]
    supporting.map(item => (item \ "display" \ "miniNavData" \ "id").as[String]) shouldBe
      List(liveSubnav.id, liveSubnav.id)
    (json(1) \ "display" \ "showMiniNav").as[Boolean] shouldBe true
    (json(1) \ "supportingContent" \ 0 \ "display" \ "showMiniNav").as[Boolean] shouldBe false
  }

  it should "preserve image suppression and leave content without a source trail disabled" in {
    val source = trail("sport/test")
    val item = curated(source)
    val pressed = press(List(item), List(source), suppressImages = true).head

    pressed.display.imageHide shouldBe true
    pressed.display.miniNavData shouldBe Some(liveSubnav)
    press(List(item), Nil).head shouldBe PressedContent.make(item, false)
  }

  it should "serialize mini-nav data through the front rendering model sent to DCR" in {
    val source = trail("snap/test")
    val item = fapi.LatestSnap.fromTrailAndContent(source, None)
    val pressed = press(List(item), List(source))
    val collection = FixtureBuilder.mkPressedCollection("test", curated = pressed)
    val page = FixtureBuilder.mkPressedPage(List(collection))
    val pageType = PageType(false, true, false, false, false, false, false)
    val model = DotcomFrontsRenderingDataModel(page, FakeRequest(), pageType, Nil, None, None)
    val json = DotcomFrontsRenderingDataModel.toJson(model)
    val display = json \ "pressedPage" \ "collections" \ 0 \ "curated" \ 0 \ "display"

    (display \ "showMiniNav").as[Boolean] shouldBe true
    (display \ "miniNavData" \ "id").as[String] shouldBe liveSubnav.id
  }

  it should "read pressed display settings created before mini-nav fields existed" in {
    val source = trail("snap/test", Json.obj())
    val display = PressedDisplaySettings.make(fapi.LatestSnap.fromTrailAndContent(source, None), None)
    val json = Json.toJson(display)(PressedContentFormat.pressedDisplaySettings).as[JsObject] -
      "showMiniNav" - "miniNavData"

    json.as[PressedDisplaySettings](PressedContentFormat.pressedDisplaySettings) shouldBe display
  }
}
