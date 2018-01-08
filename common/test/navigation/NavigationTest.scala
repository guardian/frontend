package navigation

import common.editions._
import NavLinks._
import com.gu.contentapi.client.model.v1.ItemResponse
import model.{Content, ContentPage, ContentType, Page, MetaData}
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import test.{ConfiguredTestSuite, WithMaterializer, WithTestContentApiClient, WithTestWsClient}


@DoNotDiscover class NavigationTest
  extends FlatSpec
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
      webTitle = ""
    )
  }

  "Simple menu" should "just return the 5 primary links" in {
    NavMenu(Uk).pillars should be(Seq(ukNewsPillar, ukOpinionPillar, ukSportPillar, ukArtsPillar, ukLifestylePillar))
  }

  "the route `/cities`" should "return the NavLink for cities" in {
    val edition = International
    val maybeCitiesNavLink = NavRoot(edition).findDescendantByUrl("/cities", edition)

    maybeCitiesNavLink.map( l => l should be(cities) )
  }

  "On `/index/contributors`, the parent" should "be Opinion" in {
    val edition = Us
    val root =  NavRoot(edition)
    val maybeNavLink = root.findDescendantByUrl("/index/contributors", edition)
    val maybeParent = maybeNavLink.flatMap( link => root.findParent(link, edition) )

    maybeParent.map( p => p should be(usOpinionPillar) )
  }

  "On `/football`, the parent" should "be Sport" in {
    val edition = Au
    val root =  NavRoot(edition)
    val maybeNavLink = root.findDescendantByUrl("/football", edition)
    val maybeParent = maybeNavLink.flatMap( link => root.findParent(link, edition) )

    maybeParent.map( p => p should be(auSportPillar) )
  }

  "On `/football/tables`, the parent" should "be football, but the pillar should be Sport" in {
    val edition = Au
    val root =  NavRoot(edition)
    val maybeNavLink = root.findDescendantByUrl("/football/tables", edition)
    val parent = maybeNavLink.flatMap( link => root.findParent(link, edition) )
    val pillar = root.getPillar(parent, edition)

    parent.map(_ should be(football))
    pillar.map(_ should be(auSportPillar))
  }

  "On `/environment/climate-change`, the parent" should "be environment, but the pillar should be News" in {
    val edition = Uk
    val root =  NavRoot(edition)
    val maybeNavLink = root.findDescendantByUrl("/environment/climate-change", edition)
    val parent = maybeNavLink.flatMap( link => root.findParent(link, edition) )
    val pillar = root.getPillar(parent, edition)

    parent.map(_ should be(ukEnvironment))
    pillar.map(_ should be(ukNewsPillar))
  }

  "On `/uk/scotland`, the parent" should "be Uk News, but the pillar should be News" in {
    val edition = Uk
    val root =  NavRoot(edition)
    val maybeNavLink = root.findDescendantByUrl("/uk/scotland", edition)
    val parent = maybeNavLink.flatMap( link => root.findParent(link, edition) )
    val pillar = root.getPillar(parent, edition)

    parent.map(_ should be(ukNews))
    pillar.map(_ should be(ukNewsPillar))
  }

  "On `/money/work-and-careers`, the parent" should "be Money, but the pillar should be LifeStyle" in {
    val edition = Uk
    val root =  NavRoot(edition)
    val maybeNavLink = root.findDescendantByUrl("/money/work-and-careers", edition)
    val parent = maybeNavLink.flatMap( link => root.findParent(link, edition) )
    val pillar = root.getPillar(parent, edition)

    parent.map(_ should be(money))
    pillar.map(_ should be(ukLifestylePillar))
  }

  "On `/uk-news`, the subnav" should "have a parent, and children in the subnav" in {
    val edition = Uk
    val root =  NavRoot(edition)
    val maybeNavLink = root.findDescendantByUrl("/uk-news", edition)
    val parent = maybeNavLink.flatMap( link => root.findParent(link, edition) )
    val pillar = root.getPillar(parent, edition)
    val subnav = NavMenu.getSubnav(fakePage(), maybeNavLink, parent, pillar)

    subnav.parent.map( p => p should be(ukNews) )
    subnav.children should be(ukNews.children)
  }

  "On `/money/work-and-careers`, the subnav" should "have a parent, and children in the subnav" in {
    val edition = Uk
    val root =  NavRoot(edition)
    val maybeNavLink = root.findDescendantByUrl("/money/work-and-careers", edition)
    val parent = maybeNavLink.flatMap( link => root.findParent(link, edition) )
    val pillar = root.getPillar(parent, edition)
    val subnav = NavMenu.getSubnav(fakePage(), maybeNavLink, parent, pillar)

    subnav.parent.map( p => p should be(money) )
    subnav.children should be(money.children)
  }

  "On `/culture`, the subnav" should "only have children, which are not tertiary" in {
    val edition = Au
    val root =  NavRoot(edition)
    val maybeNavLink = root.findDescendantByUrl("/culture", edition)
    val parent = maybeNavLink.flatMap( link => root.findParent(link, edition) )
    val pillar = root.getPillar(parent, edition)
    val subnav = NavMenu.getSubnav(fakePage(), maybeNavLink, parent, pillar)

    subnav.parent.isDefined should be(false)
    subnav.children should be(auArtsPillar.children)
  }

  "The section `Indigenous Australians`" should "still be in the pillar News in the Uk edition" in {
    val edition = Uk
    val root = NavRoot(edition)
    val maybeNavLink = root.findDescendantByUrl("/australia-news/indigenous-australians", edition)
    val parent = maybeNavLink.flatMap( link => root.findParent(link, edition) )
    val pillar = root.getPillar(parent, edition)


    pillar.map(_ should be(auNewsPillar))
  }

  "The section `AU fashion`" should "still be in the Lifesstyle Pillar in the Us edition" in {
    val edition = Us
    val root = NavRoot(edition)
    val maybeNavLink = root.findDescendantByUrl("/au/lifeandstyle/fashion", edition)
    val parent = maybeNavLink.flatMap( link => root.findParent(link, edition) )
    val pillar = root.getPillar(parent, edition)

    pillar.map(_ should be(auLifestylePillar))
  }

  "On guardian professionals, the pillar" should "be None, and subnav should be for crosswords" in {
    val edition = Uk
    val root = NavRoot(edition)
    val maybeNavLink = root.findDescendantByUrl("/guardian-professional", edition)
    val parent = maybeNavLink.flatMap( link => root.findParent(link, edition) )
    val pillar = root.getPillar(parent, edition)

    pillar should be(None)
  }

  "On crosswords, the pillar" should "be None, and subnav should be for crosswords" in {
    val edition = Uk
    val root = NavRoot(edition)
    val maybeNavLink = root.findDescendantByUrl("/crosswords", edition)
    val parent = maybeNavLink.flatMap( link => root.findParent(link, edition) )
    val pillar = root.getPillar(parent, edition)
    val subnav = NavMenu.getSubnav(fakePage(), maybeNavLink, parent, pillar)

    pillar should be(None)
    subnav.parent.map(_ should be(crosswords))
    subnav.children should be(crosswords.children)
  }

  "On cryptic crosswords the parent" should "be crosswords, and the pillar should be None" in {
    val edition = International
    val root = NavRoot(edition)
    val maybeNavLink = root.findDescendantByUrl("/crosswords/series/cryptic", edition)
    val parent = maybeNavLink.flatMap( link => root.findParent(link, edition) )
    val pillar = root.getPillar(parent, edition)
    val subnav = NavMenu.getSubnav(fakePage(), maybeNavLink, parent, pillar)

    pillar should be(None)
    subnav.parent.map(_ should be(crosswords))
    subnav.children should be(crosswords.children)
  }

  "On a food article, the pillar" should "be lifeStyle, and food should be highlighted" in {
    val edition = Uk
    val url = "lifeandstyle/2017/dec/03/chocolate-orange-tart-and-upside-down-cake-jeremy-lee-12-puddings-christmas-part-3"
    val response = testContentApiClient.getResponse(
      testContentApiClient.item(url, edition)
    )

    whenReady(response) { item: ItemResponse =>
      item.content.map { apiContent =>
        val page = TestPage(Content(apiContent))
        val menu = NavMenu(page, edition)
        val currentNavLink = menu.currentNavLink
        val pillar = menu.currentPillar

        currentNavLink.map(_ should be(food))
        pillar.map(_ should be(ukLifestylePillar))
      }
    }
  }

  "On an au immigration article, the pillar" should "be News, and immigration should be highlighted" in {
    val edition = Au
    val url = "/world/2017/dec/04/this-is-hell-behrouz-boochani-diaries-expose-australia-refugee-shame"
    val response = testContentApiClient.getResponse(
      testContentApiClient.item(url, edition)
    )

    whenReady(response) { item: ItemResponse =>
      item.content.map { apiContent =>
        val page = TestPage(Content(apiContent))
        val menu = NavMenu(page, edition)
        val currentNavLink = menu.currentNavLink
        val pillar = menu.currentPillar

        currentNavLink.map(_ should be(auImmigration))
        pillar.map(_ should be(auNewsPillar))
      }
    }
  }
}
