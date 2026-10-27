package frontpress

import com.gu.contentapi.client.model.v1.{ContentFields, Content => ApiContent}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import com.gu.facia.api.models.{Collection, CollectionConfig, PublicationStatus}
import com.gu.facia.api.models.PublicationStatus.{Draft, Live}
import com.gu.facia.client.models.{
  CollectionJson,
  CustomSubnav,
  CustomSubnavConfig,
  CustomSubnavFormat,
  CustomSubnavHeader,
  SubnavLink,
}
import model.{FrontProperties, PressedPage, SeoData}
import model.dotcomrendering.{DotcomFrontsRenderingDataModel, PageType}
import model.facia.PressedCollection
import model.pressed.PressedContent
import org.joda.time.DateTime
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.test.FakeRequest

import java.nio.file.{Files, Paths}
import java.time.{Instant, ZoneOffset}
import scala.util.Using

class MiniNavRenderingTest extends AnyFlatSpec with Matchers {

  private def readJson(name: String): JsValue =
    Using.resource(getClass.getResourceAsStream(s"/resources/$name")) { stream =>
      Json.parse(stream)
    }

  private def readCollection(): CollectionJson = readJson("mini-nav-collection.json").as[CollectionJson]

  // S3 collection JSON references subnavs and CAPI articles; these are fetched separately in production.
  private def subnav(id: String, title: String, path: String): CustomSubnav =
    CustomSubnav(
      id = id,
      header = CustomSubnavHeader(title, Some(path), s"$title navigation"),
      format = CustomSubnavFormat.Compact,
      links = List(SubnavLink(s"More $title", path)),
      pages = Nil,
      images = None,
      palette = None,
      lastUpdated = new DateTime(1793031866891L),
      updatedBy = "Test editor",
      updatedEmail = "editor@example.com",
    )

  private val footballSubnav = subnav("4c1bf2d9-ee4f-4d4c-829a-9bcc2c25b9fb", "Football", "/football")
  private val cultureSubnav = subnav("6d4a8d7a-1048-4a55-87f3-ee6399e36d34", "Culture", "/culture")
  private val subnavConfig = CustomSubnavConfig(
    live = List(footballSubnav, cultureSubnav),
    draft = List(
      footballSubnav.copy(header = CustomSubnavHeader("Draft football", Some("/football"), "Draft football navigation")),
    ),
  )

  private def article(id: String, headline: String): ApiContent = {
    val pageCode = id.stripPrefix("internal-code/page/")
    val path = s"test/2026/oct/27/article-$pageCode"
    ApiContent(
      id = path,
      webPublicationDate = Some(Instant.ofEpochMilli(1793031866891L).atOffset(ZoneOffset.UTC).toCapiDateTime),
      webTitle = headline,
      webUrl = s"https://www.theguardian.com/$path",
      apiUrl = s"https://content.guardianapis.com/$path",
      fields = Some(ContentFields(internalPageCode = Some(pageCode.toInt), headline = Some(headline))),
    )
  }

  private def render(collectionJson: CollectionJson, config: Option[CustomSubnavConfig], status: PublicationStatus)
      : JsValue = {
    val collection = Collection.fromCollectionJsonConfigAndContent(
      "mini-nav-test",
      Some(collectionJson),
      CollectionConfig.empty.copy(collectionType = "flexible/general"),
    )
    val articles = collectionJson.live.flatMap { trail =>
      article(trail.id, trail.safeMeta.json("baselineCapiHeadline").as[String]) ::
        trail.safeMeta.supporting.toList.flatten.map { supporting =>
          article(supporting.id, supporting.safeMeta.json("baselineCapiHeadline").as[String])
        }
    }.toSet
    val content = Collection.contentFrom(
      collection = collection,
      content = articles,
      linkSnapBrandingsByEdition = Map.empty,
      from = collection => if (status == Draft) collection.draft.getOrElse(collection.live) else collection.live,
      customSubnavConfig = config,
      status = status,
    )
    val pressedCollection = PressedCollection.fromCollectionWithCuratedAndBackfill(
      collection,
      content.map(PressedContent.make(_, suppressImages = false)),
      backfill = Nil,
      treats = Nil,
    )
    val page = PressedPage("uk", SeoData.fromPath("uk"), FrontProperties.empty, List(pressedCollection))
    // Include the pressed S3 write/read boundary before building the rendering request.
    val reloadedPage = Json.parse(Json.stringify(Json.toJson(page))).as[PressedPage]
    val model = DotcomFrontsRenderingDataModel(
      page = reloadedPage,
      request = FakeRequest("GET", "/uk").withHeaders("Host" -> "www.theguardian.com"),
      pageType = PageType(
        hasShowcaseMainElement = false,
        isFront = true,
        isLiveblog = false,
        isMinuteArticle = false,
        isPaidContent = false,
        isPreview = status == Draft,
        isSensitive = false,
      ),
      mostViewed = Nil,
      deeplyRead = None,
      customSubnav = None,
    )
    // Keep build-specific metadata stable so the full payload fixture works across commits and CI builds.
    DotcomFrontsRenderingDataModel.toJson(
      model.copy(config =
        model.config ++ Json.obj(
          "buildNumber" -> "test-build",
          "revisionNumber" -> "test-revision",
          "stage" -> "TEST",
        ),
      ),
    )
  }

  private def cards(json: JsValue): List[JsObject] =
    ((json \ "pressedPage" \ "collections")(0) \ "curated").as[List[JsObject]]

  "Mini-nav rendering" should "press the S3 collection and match the complete expected live DCR JSON payload" in {
    val json = render(readCollection(), Some(subnavConfig), Live)
    val curated = cards(json)

    curated should have size 3
    curated.map(card => (card \ "card" \ "id").as[String]) shouldBe List(
      "test/2026/oct/27/article-17712690",
      "test/2026/oct/27/article-17609873",
      "test/2026/oct/27/article-17653635",
    )
    curated.map(card => (card \ "display" \ "showMiniNav").as[Boolean]) shouldBe List(true, true, true)
    val expectedSubnavs = List(footballSubnav, cultureSubnav, cultureSubnav)
    curated.zip(expectedSubnavs).foreach { case (card, expected) =>
      (card \ "display" \ "miniNavData").as[CustomSubnav] shouldBe expected
    }
    (curated.head \ "card" \ "group").as[String] shouldBe "3"
    val supporting = (curated.head \ "supportingContent").as[List[JsObject]]
    supporting should have size 1
    (supporting.head \ "card" \ "id").as[String] shouldBe "test/2026/oct/27/article-17731294"
    (supporting.head \ "display" \ "showMiniNav").as[Boolean] shouldBe false
    (supporting.head \ "display" \ "miniNavData").toOption shouldBe None

    val output = Paths.get("facia-press/target/mini-nav-dcr-response.json")
    Files.createDirectories(output.getParent)
    Files.writeString(output, Json.prettyPrint(json))
    info(s"DCR request JSON written to $output")

    json shouldBe readJson("mini-nav-dcr-response.json")
  }

  it should "use draft subnav data in preview and fall back to live data for unchanged subnavs" in {
    val curated = cards(render(readCollection(), Some(subnavConfig), Draft))

    curated should have size 3
    (curated.head \ "display" \ "miniNavData" \ "header" \ "headerText").as[String] shouldBe "Draft football"
    curated.tail.foreach { card =>
      (card \ "display" \ "miniNavData").as[CustomSubnav] shouldBe cultureSubnav
    }
  }

  it should "keep the show flag but omit unresolved subnav data when the subnav config is unavailable" in {
    val curated = cards(render(readCollection(), None, Live))

    curated should have size 3
    curated.foreach { card =>
      (card \ "display" \ "showMiniNav").as[Boolean] shouldBe true
      (card \ "display" \ "miniNavData").toOption shouldBe None
    }
  }
}
