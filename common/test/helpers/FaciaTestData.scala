package helpers

import java.time.ZoneOffset

import com.gu.contentapi.client.model.v1.{ContentFields, Content => ApiContent}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import com.gu.facia.client.models.{EU27Territory, NZTerritory}
import common.Edition
import common.editions.{Au, Uk, Us}
import implicits.Dates.jodaToJavaInstant
import model.facia.PressedCollection
import model.pressed.{CollectionConfig, PressedContent}
import model.{PressedPage, _}
import org.joda.time.DateTime
import services.FaciaContentConvert

object TestContent {
  def newFaciaContent(u: String): PressedContent = {
    val content = ApiContent(
      id = u,
      sectionId = None,
      sectionName = None,
      webPublicationDate = Some(jodaToJavaInstant(DateTime.now).atOffset(ZoneOffset.UTC).toCapiDateTime),
      webTitle = "",
      webUrl = "",
      apiUrl = "",
      elements = None,
      fields = Some(ContentFields(liveBloggingNow = Some(true))),
    )
    FaciaContentConvert.contentToFaciaContent(content)
  }
}

class TestPageFront(val id: String, edition: Edition, faciaPage: PressedPage) {
  val query = null
  def close(): Unit = {}
  def apply(): Option[PressedPage] = Some(faciaPage)
}

trait ModelHelper {
  val emptyConfig = CollectionConfig.empty
}

trait FaciaTestData extends ModelHelper {

  val ukFrontTrailIds: Seq[String] =
    Seq(
      "/education/2013/oct/08/england-young-people-league-table-basic-skills-oecd",
      "/society/2013/oct/08/malaria-vaccine-trial-children-babies",
      "/world/2013/oct/08/brazil-accuses-canada-spying-nsa-leaks",
      "/film/2013/oct/08/gravity-science-astrophysicist",
      "/money/work-blog/2013/oct/08/long-hours-culture-overworked",
    )

  val usFrontTrailIds: Seq[String] =
    Seq(
      "/world/2013/oct/07/obama-al-liby-capture-legal-system",
      "/world/2013/oct/07/obama-john-boehner-clean-budget-bill",
      "/world/2013/oct/08/palestinian-territories-israel-control-hurting-economy",
      "/commentisfree/2013/oct/07/government-shutdown-how-it-ends",
      "/commentisfree/2013/oct/07/miley-cyrus-music-business-women-sinead-oconnor",
    )

  val auFrontTrailIds: Seq[String] =
    Seq(
      "/world/2013/oct/08/abbott-defends-travel-allowance-claims",
      "/technology/2013/oct/07/australias-fastmail-secure-email-nsa",
      "/world/2013/oct/08/abbott-apologises-asylum-malaysia-solution",
      "/world/2013/oct/07/no-threats-west-papuans-consulate",
      "/commentisfree/2013/oct/07/feminism-rebranding-man-hater",
    )

  val europeFrontTrailIds: Seq[String] = Seq(
    "/world/2024/nov/27/plan-to-cut-berlin-arts-budget-will-destroy-citys-culture-directors-warn",
    "/stage/2024/nov/27/afd-threats-to-german-democracy-on-stage-maximilian-steinbeis-a-citizen-of-the-people",
    "/commentisfree/2024/nov/27/france-cannabis-consumption-europe-tax-decriminalisation-crime",
    "/football/2024/nov/27/bodo-glimt-manchester-united-europa-league",
    "/books/2024/nov/26/freedom-by-angela-merkel-review-settling-scores-with-silence",
  )

  val europeBetaFrontTrailIds: Seq[String] = Seq(
    "/business/2024/nov/27/just-eat-to-delist-from-london-stock-exchange-to-cut-complexity-and-costs",
    "/world/2024/nov/26/uk-labour-cabinet-ministers-sanctions-russia-storm-shadow-missiles",
    "/business/2024/nov/27/fining-budget-airlines-will-make-flying-more-expensive-says-easyjet-boss",
    "/world/2024/nov/26/irish-pm-simon-harris-slump-drops-points-polls-election-fine-gael",
    "/commentisfree/2024/nov/25/the-guardian-view-on-romanias-presidential-election-a-stable-ukrainian-ally-wobblese",
  )

  val cultureTrailIds: Seq[String] =
    Seq(
      "/film/2013/oct/08/gravity-science-astrophysicist",
      "/music/2013/oct/08/annie-lennox-pornographic-miley-cyrus",
      "/film/2013/oct/08/oscars-best-foreign-language-rules-revised",
      "/music/2013/oct/08/lady-gaga-artpop-album-cover",
      "/technology/gamesblog/2013/oct/03/red-cross-players-accountable-war-crimes",
    )

  val ukFrontTrails: Seq[PressedContent] = ukFrontTrailIds map TestContent.newFaciaContent
  val usFrontTrails: Seq[PressedContent] = usFrontTrailIds map TestContent.newFaciaContent
  val auFrontTrails: Seq[PressedContent] = auFrontTrailIds map TestContent.newFaciaContent
  val europeFrontTrails: Seq[PressedContent] = europeFrontTrailIds map TestContent.newFaciaContent
  val europeBetaFrontTrails: Seq[PressedContent] = europeBetaFrontTrailIds map TestContent.newFaciaContent

  val cultureFrontTrails: Seq[PressedContent] = cultureTrailIds map TestContent.newFaciaContent

  val ukFaciaPage: PressedPage = PressedPage(
    id = "uk",
    SeoData.fromPath("uk"),
    FrontProperties.empty,
    collections = List(
      PressedCollection(
        id = "uk/news/regular-stories",
        displayName = "",
        curated = ukFrontTrails.toList,
        backfill = Nil,
        treats = Nil,
        lastUpdated = None,
        href = None,
        description = None,
        collectionType = "",
        uneditable = false,
        showTags = false,
        showSections = false,
        hideKickers = false,
        showDateHeader = false,
        showLatestUpdate = false,
        config = CollectionConfig.empty,
        hasMore = false,
        targetedTerritory = None,
      ),
    ),
  )

  val usFaciaPage: PressedPage = PressedPage(
    id = "us",
    SeoData.fromPath("us"),
    FrontProperties.empty,
    collections = List(
      PressedCollection(
        id = "us/news/regular-stories",
        displayName = "",
        curated = usFrontTrails.toList,
        backfill = Nil,
        treats = Nil,
        lastUpdated = None,
        href = None,
        description = None,
        collectionType = "",
        uneditable = false,
        showTags = false,
        showSections = false,
        hideKickers = false,
        showDateHeader = false,
        showLatestUpdate = false,
        config = CollectionConfig.empty,
        hasMore = false,
        targetedTerritory = None,
      ),
    ),
  )

  val auFaciaPage: PressedPage = PressedPage(
    id = "au",
    SeoData.fromPath("au"),
    FrontProperties.empty,
    collections = List(
      PressedCollection(
        id = "au/news/regular-stories",
        displayName = "",
        curated = auFrontTrails.toList,
        backfill = Nil,
        treats = Nil,
        lastUpdated = None,
        href = None,
        description = None,
        collectionType = "",
        uneditable = false,
        showTags = false,
        showSections = false,
        hideKickers = false,
        showDateHeader = false,
        showLatestUpdate = false,
        config = CollectionConfig.empty,
        hasMore = false,
        targetedTerritory = None,
      ),
    ),
  )

  val europeFaciaPage: PressedPage = PressedPage(
    id = "europe",
    SeoData.fromPath("europe"),
    FrontProperties.empty,
    collections = List(
      PressedCollection(
        id = "europe/news/regular-stories",
        displayName = "",
        curated = europeFrontTrails.toList,
        backfill = Nil,
        treats = Nil,
        lastUpdated = None,
        href = None,
        description = None,
        collectionType = "",
        uneditable = false,
        showTags = false,
        showSections = false,
        hideKickers = false,
        showDateHeader = false,
        showLatestUpdate = false,
        config = CollectionConfig.empty,
        hasMore = false,
        targetedTerritory = None,
      ),
    ),
  )

  val europeBetaFaciaPageWithTargetedTerritory: PressedPage = PressedPage(
    id = "europe-beta",
    SeoData.fromPath("europe-beta"),
    FrontProperties.empty,
    collections = List(
      PressedCollection(
        id = "europe-beta/news/regular-stories",
        displayName = "",
        curated = europeBetaFrontTrails.toList,
        backfill = Nil,
        treats = Nil,
        lastUpdated = None,
        href = None,
        description = None,
        collectionType = "",
        uneditable = false,
        showTags = false,
        showSections = false,
        hideKickers = false,
        showDateHeader = false,
        showLatestUpdate = false,
        config = CollectionConfig.empty,
        hasMore = false,
        targetedTerritory = Some(EU27Territory),
      ),
    ),
  )

  val ukCultureFaciaPage: PressedPage = PressedPage(
    id = "uk/culture",
    SeoData.fromPath("uk/culture"),
    FrontProperties.empty,
    collections = List(
      PressedCollection(
        id = "uk/culture/regular-stories",
        displayName = "",
        curated = cultureFrontTrails.toList,
        backfill = Nil,
        treats = Nil,
        lastUpdated = None,
        href = None,
        description = None,
        collectionType = "",
        uneditable = false,
        showTags = false,
        showSections = false,
        hideKickers = false,
        showDateHeader = false,
        showLatestUpdate = false,
        config = CollectionConfig.empty,
        hasMore = false,
        targetedTerritory = None,
      ),
    ),
  )

  val usCultureFaciaPage: PressedPage = PressedPage(
    id = "us/culture",
    SeoData.fromPath("us/culture"),
    FrontProperties.empty,
    collections = List(
      PressedCollection(
        id = "au/culture/regular-stories",
        displayName = "",
        curated = cultureFrontTrails.toList,
        backfill = Nil,
        treats = Nil,
        lastUpdated = None,
        href = None,
        description = None,
        collectionType = "",
        uneditable = false,
        showTags = false,
        showSections = false,
        hideKickers = false,
        showDateHeader = false,
        showLatestUpdate = false,
        config = CollectionConfig.empty,
        hasMore = false,
        targetedTerritory = None,
      ),
    ),
  )

  val auCultureFaciaPage: PressedPage = PressedPage(
    id = "au/culture",
    SeoData.fromPath("au/culture"),
    FrontProperties.empty,
    collections = List(
      PressedCollection(
        id = "au/culture/regular-stories",
        displayName = "",
        curated = cultureFrontTrails.toList,
        backfill = Nil,
        treats = Nil,
        lastUpdated = None,
        href = None,
        description = None,
        collectionType = "",
        uneditable = false,
        showTags = false,
        showSections = false,
        hideKickers = false,
        showDateHeader = false,
        showLatestUpdate = false,
        config = CollectionConfig.empty,
        hasMore = false,
        targetedTerritory = None,
      ),
    ),
  )

  val internationalFaciaPageWithTargetedTerritories: PressedPage = PressedPage(
    id = "international",
    SeoData.fromPath("international"),
    FrontProperties.empty,
    collections = List(
      PressedCollection(
        id = "international/nz",
        displayName = "One",
        curated = cultureFrontTrails.toList,
        backfill = Nil,
        treats = Nil,
        lastUpdated = None,
        href = None,
        description = None,
        collectionType = "",
        uneditable = false,
        showTags = false,
        showSections = false,
        hideKickers = false,
        showDateHeader = false,
        showLatestUpdate = false,
        config = CollectionConfig.empty,
        hasMore = false,
        targetedTerritory = Some(NZTerritory),
      ),
      PressedCollection(
        id = "international/eu",
        displayName = "Two",
        curated = cultureFrontTrails.toList,
        backfill = Nil,
        treats = Nil,
        lastUpdated = None,
        href = None,
        description = None,
        collectionType = "",
        uneditable = false,
        showTags = false,
        showSections = false,
        hideKickers = false,
        showDateHeader = false,
        showLatestUpdate = false,
        config = CollectionConfig.empty,
        hasMore = false,
        targetedTerritory = Some(EU27Territory),
      ),
      PressedCollection(
        id = "international/normal",
        displayName = "Three",
        curated = cultureFrontTrails.toList,
        backfill = Nil,
        treats = Nil,
        lastUpdated = None,
        href = None,
        description = None,
        collectionType = "",
        uneditable = false,
        showTags = false,
        showSections = false,
        hideKickers = false,
        showDateHeader = false,
        showLatestUpdate = false,
        config = CollectionConfig.empty,
        hasMore = false,
        targetedTerritory = None,
      ),
    ),
  )

  val defaultAgentContents: Map[String, TestPageFront] = Map(
    ("uk", new TestPageFront("uk", Uk, ukFaciaPage)),
    ("us", new TestPageFront("us", Us, usFaciaPage)),
    ("au", new TestPageFront("au", Au, auFaciaPage)),
    ("europe", new TestPageFront("europe", Au, europeFaciaPage)),
    ("europe-beta", new TestPageFront("europe-beta", Au, europeBetaFaciaPageWithTargetedTerritory)),
    ("uk/culture", new TestPageFront("uk/culture", Uk, ukCultureFaciaPage)),
    ("us/culture", new TestPageFront("us/culture", Us, usCultureFaciaPage)),
    ("au/culture", new TestPageFront("au/culture", Au, auCultureFaciaPage)),
  )
}
