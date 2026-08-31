package navigation

import ab.ABTests
import common.Edition
import common.editions._
import NavLinks._
import com.gu.contentapi.client.model.v1.ItemResponse
import model.{Content, ContentPage, ContentType, MetaData, Page, SectionId}
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest
import staticpages.StaticPages
import test.{ConfiguredTestSuite, WithMaterializer, WithTestContentApiClient, WithTestWsClient}

@DoNotDiscover class NavigationTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestContentApiClient
    with ScalaFutures {

  private case class TestPage(content: ContentType) extends ContentPage {
    override lazy val item = content
  }

  private case class fakePage() extends Page {
    override val metadata = MetaData.make(
      id = "",
      section = None,
      webTitle = "",
    )
  }

  private case class NavigationPage(sectionId: String) extends Page {
    override val metadata = MetaData.make(
      id = sectionId,
      section = Some(SectionId(sectionId)),
      webTitle = sectionId,
    )
  }

  "On `/index/contributors`, the parent" should "be Opinion" in {
    val edition = Uk
    val root = NavMenu.navRoot(edition)
    val maybeNavLink = NavMenu.findDescendantByUrl("/index/contributors", edition, root.children, root.otherLinks)
    val maybeParent = maybeNavLink.flatMap(link => NavMenu.findParent(link, edition, root.children, root.otherLinks))

    maybeParent.map(p => p should be(ukOpinionPillar))
  }

  "On `/football`, the parent" should "be Sport" in {
    val edition = Au
    val root = NavMenu.navRoot(edition)
    val maybeNavLink = NavMenu.findDescendantByUrl("/football", edition, root.children, root.otherLinks)
    val maybeParent = maybeNavLink.flatMap(link => NavMenu.findParent(link, edition, root.children, root.otherLinks))

    maybeParent.map(p => p should be(auSportPillar))
  }

  "On `/football/tables`, the parent" should "be football, but the pillar should be Sport" in {
    val edition = Au
    val root = NavMenu.navRoot(edition)
    val maybeNavLink = NavMenu.findDescendantByUrl("/football/tables", edition, root.children, root.otherLinks)
    val parent = maybeNavLink.flatMap(link => NavMenu.findParent(link, edition, root.children, root.otherLinks))
    val pillar = NavMenu.getPillar(parent, edition, root.children, root.otherLinks)

    parent.map(_ should be(football))
    pillar.map(_ should be(auSportPillar))
  }

  "On `/environment/climate-change`, the parent" should "be environment, but the pillar should be News" in {
    val edition = Uk
    val root = NavMenu.navRoot(edition)
    val maybeNavLink =
      NavMenu.findDescendantByUrl("/environment/climate-change", edition, root.children, root.otherLinks)
    val parent = maybeNavLink.flatMap(link => NavMenu.findParent(link, edition, root.children, root.otherLinks))
    val pillar = NavMenu.getPillar(parent, edition, root.children, root.otherLinks)

    parent.map(_ should be(ukEnvironment))
    pillar.map(_ should be(ukNewsPillar))
  }

  "On `/uk/scotland`, the parent" should "be Uk News, but the pillar should be News" in {
    val edition = Uk
    val root = NavMenu.navRoot(edition)
    val maybeNavLink = NavMenu.findDescendantByUrl("/uk/scotland", edition, root.children, root.otherLinks)
    val parent = maybeNavLink.flatMap(link => NavMenu.findParent(link, edition, root.children, root.otherLinks))
    val pillar = NavMenu.getPillar(parent, edition, root.children, root.otherLinks)

    parent.map(_ should be(ukNews))
    pillar.map(_ should be(ukNewsPillar))
  }

  "On `/money/work-and-careers`, the parent" should "be Money, but the pillar should be LifeStyle" in {
    val edition = Uk
    val root = NavMenu.navRoot(edition)
    val maybeNavLink = NavMenu.findDescendantByUrl("/money/work-and-careers", edition, root.children, root.otherLinks)
    val parent = maybeNavLink.flatMap(link => NavMenu.findParent(link, edition, root.children, root.otherLinks))
    val pillar = NavMenu.getPillar(parent, edition, root.children, root.otherLinks)

    parent.map(_ should be(money))
    pillar.map(_ should be(ukLifestylePillar))
  }

  "On `/uk-news`, the subnav" should "have a parent, and children in the subnav" in {
    val edition = Uk
    val root = NavMenu.navRoot(edition)
    val maybeNavLink = NavMenu.findDescendantByUrl("/uk-news", edition, root.children, root.otherLinks)
    val parent = maybeNavLink.flatMap(link => NavMenu.findParent(link, edition, root.children, root.otherLinks))
    val pillar = NavMenu.getPillar(parent, edition, root.children, root.otherLinks)
    val subnav = NavMenu.getSubnav(fakePage().metadata.customSignPosting, maybeNavLink, parent, pillar)

    subnav shouldBe Some(ParentSubnav(ukNews, ukNews.children))
  }

  "On `/money/work-and-careers`, the subnav" should "have a parent, and children in the subnav" in {
    val edition = Uk
    val root = NavMenu.navRoot(edition)
    val maybeNavLink = NavMenu.findDescendantByUrl("/money/work-and-careers", edition, root.children, root.otherLinks)
    val parent = maybeNavLink.flatMap(link => NavMenu.findParent(link, edition, root.children, root.otherLinks))
    val pillar = NavMenu.getPillar(parent, edition, root.children, root.otherLinks)
    val subnav = NavMenu.getSubnav(fakePage().metadata.customSignPosting, maybeNavLink, parent, pillar)

    subnav shouldBe Some(ParentSubnav(money, money.children))
  }

  "On `/culture`, the subnav" should "only have children, which are not tertiary" in {
    val edition = Au
    val root = NavMenu.navRoot(edition)
    val maybeNavLink = NavMenu.findDescendantByUrl("/culture", edition, root.children, root.otherLinks)
    val parent = maybeNavLink.flatMap(link => NavMenu.findParent(link, edition, root.children, root.otherLinks))
    val pillar = NavMenu.getPillar(parent, edition, root.children, root.otherLinks)
    val subnav = NavMenu.getSubnav(fakePage().metadata.customSignPosting, maybeNavLink, parent, pillar)

    subnav shouldBe Some(FlatSubnav(auCulturePillar.children))
  }

  "The section `Indigenous Australians`" should "still be in the pillar News in the Uk edition" in {
    val edition = Uk
    val root = NavMenu.navRoot(edition)
    val maybeNavLink =
      NavMenu.findDescendantByUrl("/australia-news/indigenous-australians", edition, root.children, root.otherLinks)
    val parent = maybeNavLink.flatMap(link => NavMenu.findParent(link, edition, root.children, root.otherLinks))
    val pillar = NavMenu.getPillar(parent, edition, root.children, root.otherLinks)

    pillar.map(_ should be(auNewsPillar))
  }

  "The section `AU fashion`" should "still be in the Lifesstyle Pillar in the Us edition" in {
    val edition = Us
    val root = NavMenu.navRoot(edition)
    val maybeNavLink = NavMenu.findDescendantByUrl("/au/lifeandstyle/fashion", edition, root.children, root.otherLinks)
    val parent = maybeNavLink.flatMap(link => NavMenu.findParent(link, edition, root.children, root.otherLinks))
    val pillar = NavMenu.getPillar(parent, edition, root.children, root.otherLinks)

    pillar.map(_ should be(auLifestylePillar))
  }

  "On guardian professionals, the pillar" should "be None, and subnav should be for crosswords" in {
    val edition = Uk
    val root = NavMenu.navRoot(edition)
    val maybeNavLink = NavMenu.findDescendantByUrl("/guardian-professional", edition, root.children, root.otherLinks)
    val parent = maybeNavLink.flatMap(link => NavMenu.findParent(link, edition, root.children, root.otherLinks))
    val pillar = NavMenu.getPillar(parent, edition, root.children, root.otherLinks)

    pillar should be(None)
  }

  "On crosswords, the pillar" should "be None, and subnav should be for crosswords" in {
    val edition = Uk
    val root = NavMenu.navRoot(edition)
    val maybeNavLink = NavMenu.findDescendantByUrl("/crosswords", edition, root.children, root.otherLinks)
    val parent = maybeNavLink.flatMap(link => NavMenu.findParent(link, edition, root.children, root.otherLinks))
    val pillar = NavMenu.getPillar(parent, edition, root.children, root.otherLinks)
    val subnav = NavMenu.getSubnav(fakePage().metadata.customSignPosting, maybeNavLink, parent, pillar)

    pillar should be(None)

    subnav shouldBe Some(ParentSubnav(legacyCrosswords, legacyCrosswords.children))
  }

  "On cryptic crosswords the parent" should "be crosswords, and the pillar should be None" in {
    val edition = International
    val root = NavMenu.navRoot(edition)
    val maybeNavLink =
      NavMenu.findDescendantByUrl("/crosswords/series/cryptic", edition, root.children, root.otherLinks)
    val parent = maybeNavLink.flatMap(link => NavMenu.findParent(link, edition, root.children, root.otherLinks))
    val pillar = NavMenu.getPillar(parent, edition, root.children, root.otherLinks)
    val subnav = NavMenu.getSubnav(fakePage().metadata.customSignPosting, maybeNavLink, parent, pillar)

    pillar should be(None)

    subnav shouldBe Some(ParentSubnav(legacyCrosswords, legacyCrosswords.children))
  }

  "On a food article, the pillar" should "be lifeStyle, and food should be highlighted" in {
    val edition = Uk
    val url = "/lifeandstyle/2018/aug/01/can-you-learn-to-cook-like-a-chef-by-watching-youtube"
    val response = testContentApiClient.getResponse(
      testContentApiClient.item(url, edition),
    )

    whenReady(response) { item: ItemResponse =>
      item.content.map { apiContent =>
        val page = TestPage(Content(apiContent))
        val menu = NavMenu(page, edition, FakeRequest())
        val currentNavLink = menu.currentNavLink
        val pillar = menu.currentPillar

        currentNavLink.map(_ should be(food))
        pillar.map(_ should be(ukLifestylePillar))
      }
    }
  }

  "On an au immigration article, the pillar" should "be News, and immigration should be highlighted" in {
    val edition = Au
    val url = "world/2017/dec/04/this-is-hell-behrouz-boochani-diaries-expose-australia-refugee-shame"
    val response = testContentApiClient.getResponse(
      testContentApiClient.item(url, edition),
    )

    whenReady(response) { item: ItemResponse =>
      item.content.map { apiContent =>
        val page = TestPage(Content(apiContent))
        val menu = NavMenu(page, edition, FakeRequest())
        val currentNavLink = menu.currentNavLink
        val pillar = menu.currentPillar

        currentNavLink.map(_ should be(auImmigration))
        pillar.map(_ should be(auNewsPillar))
      }
    }
  }

  private def requestWithParticipations(participations: String): RequestHeader = {
    val request = FakeRequest().withHeader("X-GU-Server-AB-Tests" -> participations)
    ABTests.decorateRequest("X-GU-Server-AB-Tests")(request)
  }

  "Puzzles navigation" should "use the experimental information architecture in every edition for variant requests" in {
    val request = requestWithParticipations("puzzles-new-hub:variant")
    puzzles.children shouldBe Seq(
      NavLink("Crossword", "/puzzles#crossword"),
      NavLink("Logic", "/puzzles#logic"),
      NavLink("Word games", "/puzzles#word-games"),
    )

    Edition.allEditions.foreach { edition =>
      val menu = NavMenu(StaticPages.dcrSimplePuzzlesPage("/puzzles"), edition, request)

      menu.otherLinks should contain(puzzles)
      menu.otherLinks should not contain legacyCrosswords
      menu.currentNavLink should contain(puzzles)
      menu.currentParent should contain(puzzles)
      menu.currentPillar shouldBe None
      menu.subNavSections should contain(ParentSubnav(puzzles, puzzles.children))
    }
  }

  it should "keep the production crosswords navigation in every edition for non-variant requests" in {
    Seq(
      "puzzles-new-hub:control",
      "",
      "puzzles-new-hub:unknown",
      "puzzles-new-hub:,puzzles-new-hub:variant:extra",
      "another-test:variant",
    ).foreach { participations =>
      val request = requestWithParticipations(participations)

      Edition.allEditions.foreach { edition =>
        val menu = NavMenu(NavigationPage("crosswords"), edition, request)

        menu.otherLinks should contain(legacyCrosswords)
        menu.otherLinks should not contain puzzles
        menu.currentNavLink should contain(legacyCrosswords)
        menu.currentParent should contain(legacyCrosswords)
        menu.currentPillar shouldBe None
        menu.subNavSections should contain(ParentSubnav(legacyCrosswords, legacyCrosswords.children))
      }
    }
  }

  "DCR Nav" should "contain the request-selected puzzles navigation" in {
    val variantRequest = requestWithParticipations("puzzles-new-hub:variant")
    val controlRequest = requestWithParticipations("puzzles-new-hub:control")
    val page = StaticPages.dcrSimplePuzzlesPage("/puzzles")

    Nav(page, Uk, variantRequest).otherLinks should contain(puzzles)
    Nav(page, Uk, controlRequest).otherLinks should contain(legacyCrosswords)
  }
}
