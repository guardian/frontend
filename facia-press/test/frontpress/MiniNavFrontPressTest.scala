package frontpress

import com.gu.contentapi.client.{ContentApiClient => CapiContentApiClient}
import com.gu.facia.api.models.{Collection, CollectionConfig}
import com.gu.facia.client.ApiClient
import com.gu.facia.client.models.{
  CustomSubnav,
  CustomSubnavConfig,
  CustomSubnavFormat,
  CustomSubnavHeader,
  Trail,
  TrailMetaData,
}
import model.ApplicationIdentity
import contentapi.ContentApiClient
import model.pressed.PressedContent
import org.joda.time.DateTime
import org.scalatest.flatspec.AsyncFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import services.{NewsletterService, SubnavAgent}
import services.eventgraphic.EventGraphicService

import scala.concurrent.Future

class MiniNavFrontPressTest extends AsyncFlatSpec with Matchers with MockitoSugar {
  private def subnav(id: String, url: String): CustomSubnav =
    CustomSubnav(
      id = id,
      header = CustomSubnavHeader("Header", Some(url), "Copy"),
      format = CustomSubnavFormat.Large,
      links = Nil,
      pages = Nil,
      images = None,
      palette = None,
      lastUpdated = new DateTime(0L),
      updatedBy = "editor",
      updatedEmail = "editor@example.com",
    )

  private def trail(showMiniNav: Boolean, url: String): Trail =
    Trail(
      "snap/test",
      0L,
      None,
      Some(
        Json
          .obj(
            "snapType" -> "link",
            "href" -> "https://www.theguardian.com/sport",
            "showMiniNav" -> showMiniNav,
            "miniNavUrl" -> url,
          )
          .as[TrailMetaData],
      ),
      None,
    )

  private def collection(live: Trail, draft: Trail): Collection =
    Collection(
      id = "test",
      displayName = "Test",
      href = None,
      live = List(live),
      draft = Some(List(draft)),
      treats = Nil,
      lastUpdated = None,
      updatedBy = None,
      updatedEmail = None,
      collectionConfig = CollectionConfig.empty,
      targetedTerritory = None,
    )

  private def presses(agent: SubnavAgent): List[FapiFrontPress] = {
    val ws = mock[WSClient]
    val seoClient = mock[ContentApiClient]
    val newsletters = mock[NewsletterService]
    val graphics = mock[EventGraphicService]
    val contentClient = mock[CapiContentApiClient]
    val frontsClient = mock[ApiClient]
    List(
      new LiveFapiFrontPress(ws, seoClient, newsletters, graphics, agent) {
        override implicit val capiClient: CapiContentApiClient = contentClient
        override implicit lazy val fapiClient: ApiClient = frontsClient
      },
      new DraftFapiFrontPress(ws, seoClient, newsletters, graphics, agent) {
        override implicit val capiClient: CapiContentApiClient = contentClient
        override implicit lazy val fapiClient: ApiClient = frontsClient
      },
    )
  }

  private def press(frontPress: FapiFrontPress, source: Collection): Future[List[PressedContent]] =
    frontPress
      .collectionContentWithSnaps(source)
      .fold(
        error => fail(s"Pressing failed: ${error.message}"),
        identity,
      )

  "Mini-nav front pressing" should "use each version's card URL and the correct subnav publication status" in {
    val live = subnav("live", "/live-nav")
    val draft = subnav("draft", "/draft-nav")
    val config = CustomSubnavConfig(
      live = List(live, draft.copy(updatedBy = "published editor")),
      draft = List(live.copy(updatedBy = "draft editor"), draft),
    )
    val agent = new SubnavAgent(ApplicationIdentity("facia-press")) {
      override def getSubnavConfig(): Option[CustomSubnavConfig] = Some(config)
    }
    val source = collection(trail(true, "/live-nav"), trail(true, "/draft-nav"))

    Future.traverse(presses(agent))(press(_, source)).map { results =>
      results.map(_.size) shouldBe List(1, 1)
      results.map(_.head.display.showMiniNav) shouldBe List(true, true)
      results.map(_.head.display.miniNavData) shouldBe List(Some(live), Some(draft))
    }
  }

  it should "respect different enabled settings on live and draft versions of the same card" in {
    val nav = subnav("nav", "/nav")
    val agent = new SubnavAgent(ApplicationIdentity("facia-press")) {
      override def getSubnavConfig(): Option[CustomSubnavConfig] =
        Some(CustomSubnavConfig(live = List(nav), draft = Nil))
    }

    Future
      .traverse(List((true, false), (false, true))) { case (liveEnabled, draftEnabled) =>
        val source = collection(trail(liveEnabled, "/nav"), trail(draftEnabled, "/nav"))
        Future.traverse(presses(agent))(press(_, source)).map { results =>
          results.map(_.size) shouldBe List(1, 1)
          results.map(_.head.display.showMiniNav) shouldBe List(liveEnabled, draftEnabled)
          results.map(_.head.display.miniNavData) shouldBe
            List(Option.when(liveEnabled)(nav), Option.when(draftEnabled)(nav))
        }
      }
      .map(_ => succeed)
  }

  it should "still press enabled cards when the subnav configuration is unavailable" in {
    val agent = new SubnavAgent(ApplicationIdentity("facia-press")) {
      override def getSubnavConfig(): Option[CustomSubnavConfig] = None
    }
    val source = collection(trail(true, "/nav"), trail(true, "/nav"))

    Future.traverse(presses(agent))(press(_, source)).map { results =>
      results.map(_.size) shouldBe List(1, 1)
      results.map(_.head.display.showMiniNav) shouldBe List(true, true)
      results.map(_.head.display.miniNavData) shouldBe List(None, None)
    }
  }
}
