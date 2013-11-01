package test

import common.{AkkaAgent, Edition}
import common.editions.{Au, Us, Uk}
import controllers.front.{Front, PageFront}
import model._
import model.Config
import model.FaciaPage
import org.joda.time.DateTime
import com.gu.openplatform.contentapi.model.{Content => ApiContent}

case class TestTrail(url: String) extends Trail {
  def webPublicationDate: DateTime = DateTime.now
  def shortUrl: String = ""
  def linkText: String = ""
  def headline: String = ""
  def trailText: Option[String] = None
  def section: String = ""
  def sectionName: String = ""
  def isLive: Boolean = true

  override def delegate = ApiContent("foo/2012/jan/07/bar", None, None, new DateTime, "Some trail",
    "http://www.guardian.co.uk/foo/2012/jan/07/bar",
    "http://content.guardianapis.com/foo/2012/jan/07/bar",
    elements = None,
    fields = None)
}

class TestPageFront(override val id: String, edition: Edition, faciaPage: FaciaPage) extends PageFront(id, edition) {
  override val query = null
  override def close() = {}
  override def apply(): Option[FaciaPage] = Some(faciaPage)
}

trait ModelHelper {
  def configWithId(id: String) = Config(id, None, None)

  def trailWithUrl(url: String): Trail = TestTrail(url)
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


  val ukFrontTrails: Seq[Trail]= ukFrontTrailIds map trailWithUrl
  val usFrontTrails: Seq[Trail]= usFrontTrailIds map trailWithUrl
  val auFrontTrails: Seq[Trail]= auFrontTrailIds map trailWithUrl

  val cultureFrontTrails: Seq[Trail] = cultureTrailIds map trailWithUrl

  val ukFaciaPage: FaciaPage = FaciaPage(
    id = "uk",
    collections = List(
      (configWithId("uk/news/regular-stories"),
        Collection(ukFrontTrails)
      )
    )
  )

  val usFaciaPage: FaciaPage = FaciaPage(
    id = "us",
    collections = List(
      (configWithId("us/news/regular-stories"),
        Collection(usFrontTrails)
      )
    )
  )

  val auFaciaPage: FaciaPage = FaciaPage(
    id = "us",
    collections = List(
      (configWithId("au/news/regular-stories"),
        Collection(auFrontTrails)
      )
    )
  )

  val ukCultureFaciaPage: FaciaPage = FaciaPage(
    id = "uk/culture",
    collections = List(
      (configWithId("uk/culture/regular-stories"),
        Collection(cultureFrontTrails)
        )
    )
  )
  val usCultureFaciaPage: FaciaPage = FaciaPage(
    id = "us/culture",
    collections = List(
      (configWithId("au/culture/regular-stories"),
        Collection(cultureFrontTrails)
        )
    )
  )
  val auCultureFaciaPage: FaciaPage = FaciaPage(
    id = "au/culture",
    collections = List(
      (configWithId("au/culture/regular-stories"),
        Collection(cultureFrontTrails)
        )
    )
  )

  val defaultAgentContents: Map[String, PageFront] = Map(
    ("uk", new TestPageFront("uk", Uk, ukFaciaPage)),
    ("us", new TestPageFront("us", Us, usFaciaPage)),
    ("au", new TestPageFront("au", Au, auFaciaPage)),
    ("uk/culture", new TestPageFront("uk/culture", Uk, ukCultureFaciaPage)),
    ("us/culture", new TestPageFront("us/culture", Us, usCultureFaciaPage)),
    ("au/culture", new TestPageFront("au/culture", Au, auCultureFaciaPage))
  )
}

class TestFront extends Front with FaciaTestData {
  override val pageFrontAgent = AkkaAgent[Map[String, PageFront]](defaultAgentContents)
}