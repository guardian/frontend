package test

import com.gu.facia.client.models.CollectionConfigJson
import common.{AkkaAgent, Edition}
import common.editions.{Au, Us, Uk}
import controllers.front.Front
import model._
import model.FaciaPage
import org.joda.time.DateTime
import com.gu.contentapi.client.model.{Content => ApiContent}
import services.CollectionConfigWithId

object TestContent {

  def newApiContent: ApiContent = ApiContent(
    id="",
    sectionId=None,
    sectionName=None,
    webPublicationDateOption=Some(DateTime.now),
    webTitle="",
    webUrl="",
    apiUrl="",
    elements=None
  )

  def apiContentWithMeta: ApiContentWithMeta = ApiContentWithMeta(newApiContent)

}

case class TestTrail(u: String) extends Content(TestContent.apiContentWithMeta) {
  override lazy val url = u
  override lazy val webPublicationDate: DateTime = DateTime.now
  override lazy val shortUrl: String = ""
  override lazy val linkText: String = ""
  override lazy val webUrl: String = ""
  override lazy val headline: String = ""
  override lazy val trailText: Option[String] = None
  override lazy val section: String = ""
  override lazy val sectionName: String = ""
  override lazy val isLive: Boolean = true
}

class TestPageFront(val id: String, edition: Edition, faciaPage: FaciaPage) {
  val query = null
  def close() = {}
  def apply(): Option[FaciaPage] = Some(faciaPage)
}

trait ModelHelper {
  val emptyConfig = CollectionConfigJson.emptyConfig

  def trailWithUrl(url: String): Content = TestTrail(url)
  def trailsWithUrl(url: Seq[String]): Seq[Trail] = url map trailWithUrl
}

trait FaciaTestData extends ModelHelper {

  val ukFrontTrailIds: Seq[String] =
    Seq(
      "/education/2013/oct/08/england-young-people-league-table-basic-skills-oecd",
      "/society/2013/oct/08/malaria-vaccine-trial-children-babies",
      "/world/2013/oct/08/brazil-accuses-canada-spying-nsa-leaks",
      "/film/2013/oct/08/gravity-science-astrophysicist",
      "/money/work-blog/2013/oct/08/long-hours-culture-overworked"
    )

  val usFrontTrailIds: Seq[String] =
    Seq(
      "/world/2013/oct/07/obama-al-liby-capture-legal-system",
      "/world/2013/oct/07/obama-john-boehner-clean-budget-bill",
      "/world/2013/oct/08/palestinian-territories-israel-control-hurting-economy",
      "/commentisfree/2013/oct/07/government-shutdown-how-it-ends",
      "/commentisfree/2013/oct/07/miley-cyrus-music-business-women-sinead-oconnor"
    )

  val auFrontTrailIds: Seq[String] =
    Seq(
      "/world/2013/oct/08/abbott-defends-travel-allowance-claims",
      "/technology/2013/oct/07/australias-fastmail-secure-email-nsa",
      "/world/2013/oct/08/abbott-apologises-asylum-malaysia-solution",
      "/world/2013/oct/07/no-threats-west-papuans-consulate",
      "/commentisfree/2013/oct/07/feminism-rebranding-man-hater"
    )

  val cultureTrailIds: Seq[String] =
    Seq(
      "/film/2013/oct/08/gravity-science-astrophysicist",
      "/music/2013/oct/08/annie-lennox-pornographic-miley-cyrus",
      "/film/2013/oct/08/oscars-best-foreign-language-rules-revised",
      "/music/2013/oct/08/lady-gaga-artpop-album-cover",
      "/technology/gamesblog/2013/oct/03/red-cross-players-accountable-war-crimes"
    )


  val ukFrontTrails: Seq[Content]= ukFrontTrailIds map trailWithUrl
  val usFrontTrails: Seq[Content]= usFrontTrailIds map trailWithUrl
  val auFrontTrails: Seq[Content]= auFrontTrailIds map trailWithUrl

  val cultureFrontTrails: Seq[Content] = cultureTrailIds map trailWithUrl

  val ukFaciaPage: FaciaPage = FaciaPage(
    id = "uk",
    SeoData.fromPath("uk"),
    FrontProperties.empty,
    collections = List(
      (CollectionConfigWithId("uk/news/regular-stories", emptyConfig),
      Collection(ukFrontTrails))
      )
    )

  val usFaciaPage: FaciaPage = FaciaPage(
    id = "us",
    SeoData.fromPath("us"),
    FrontProperties.empty,
    collections = List(
      (CollectionConfigWithId("us/news/regular-stories", emptyConfig),
      Collection(usFrontTrails))
    )
  )

  val auFaciaPage: FaciaPage = FaciaPage(
    id = "us",
    SeoData.fromPath("us"),
    FrontProperties.empty,
    collections = List(
      (CollectionConfigWithId("au/news/regular-stories", emptyConfig),
      Collection(auFrontTrails))
    )
  )

  val ukCultureFaciaPage: FaciaPage = FaciaPage(
    id = "uk/culture",
    SeoData.fromPath("uk/culture"),
    FrontProperties.empty,
    collections = List(
      (CollectionConfigWithId("uk/culture/regular-stories", emptyConfig),
        Collection(cultureFrontTrails)
      )
    )
  )

  val usCultureFaciaPage: FaciaPage = FaciaPage(
    id = "us/culture",
    SeoData.fromPath("us/culture"),
    FrontProperties.empty,
    collections = List(
      (CollectionConfigWithId("au/culture/regular-stories", emptyConfig),
      Collection(cultureFrontTrails)
     )
    )
  )

  val auCultureFaciaPage: FaciaPage = FaciaPage(
    id = "au/culture",
    SeoData.fromPath("au/culture"),
    FrontProperties.empty,
    collections = List(
      (CollectionConfigWithId("au/culture/regular-stories", emptyConfig),
      Collection(cultureFrontTrails)
      )
    )
  )

  val defaultAgentContents: Map[String, TestPageFront] = Map(
    ("uk", new TestPageFront("uk", Uk, ukFaciaPage)),
    ("us", new TestPageFront("us", Us, usFaciaPage)),
    ("au", new TestPageFront("au", Au, auFaciaPage)),
    ("uk/culture", new TestPageFront("uk/culture", Uk, ukCultureFaciaPage)),
    ("us/culture", new TestPageFront("us/culture", Us, usCultureFaciaPage)),
    ("au/culture", new TestPageFront("au/culture", Au, auCultureFaciaPage))
  )
}

class TestFront extends Front with FaciaTestData {
  val pageFrontAgent = AkkaAgent[Map[String, TestPageFront]](defaultAgentContents)
}
