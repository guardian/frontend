package common.commercial

import com.madgag.scala.collection.decorators.MapDecorator
import com.gu.contentapi.client.model.v1.{Content, Section, Tag}
import layout.{Breakpoint, Desktop, Mobile, Tablet}
import play.api.libs.json.{JsString, JsValue, _}

import scala.collection.immutable.Map

// Site ID passed to the Index Exchange adapter in Prebid bid requests
case class PrebidIndexSite(bp: Breakpoint, id: Int)

object PrebidIndexSite {

  implicit val breakpointFormat = new Format[Breakpoint] {
    def reads(json: JsValue): JsResult[Breakpoint] =
      json match {
        case JsString("D") => JsSuccess(Desktop)
        case JsString("T") => JsSuccess(Tablet)
        case JsString("M") => JsSuccess(Mobile)
        case _             => JsSuccess(Desktop)
      }
    def writes(breakpoint: Breakpoint): JsValue =
      breakpoint match {
        case Desktop => JsString("D")
        case Tablet  => JsString("T")
        case Mobile  => JsString("M")
        case _       => JsString("D")
      }
  }
  implicit val format = Json.format[PrebidIndexSite]

  private val defaultSiteIds = Set(
    PrebidIndexSite(Desktop, 208283),
    PrebidIndexSite(Mobile, 213553),
    PrebidIndexSite(Tablet, 215488),
  )

  // The keys in this map are section IDs.
  // Any entries can be safely removed when their section no longer exists.
  private val siteIds: Map[String, Set[PrebidIndexSite]] =
    Seq(
      "artanddesign" -> PrebidIndexSite(Desktop, 208282),
      "artanddesign" -> PrebidIndexSite(Mobile, 213552),
      "artanddesign" -> PrebidIndexSite(Tablet, 215487),
      "au" -> PrebidIndexSite(Desktop, 208281),
      "au" -> PrebidIndexSite(Mobile, 213551),
      "au" -> PrebidIndexSite(Tablet, 215486),
      "australia-news" -> PrebidIndexSite(Desktop, 208280),
      "australia-news" -> PrebidIndexSite(Mobile, 213550),
      "australia-news" -> PrebidIndexSite(Tablet, 215485),
      "books" -> PrebidIndexSite(Desktop, 208279),
      "books" -> PrebidIndexSite(Mobile, 213549),
      "books" -> PrebidIndexSite(Tablet, 215484),
      "business" -> PrebidIndexSite(Desktop, 208278),
      "business" -> PrebidIndexSite(Mobile, 213548),
      "business" -> PrebidIndexSite(Tablet, 215483),
      "careers" -> PrebidIndexSite(Desktop, 208277),
      "careers" -> PrebidIndexSite(Mobile, 213547),
      "careers" -> PrebidIndexSite(Tablet, 215482),
      "childrens-books-site" -> PrebidIndexSite(Desktop, 208276),
      "childrens-books-site" -> PrebidIndexSite(Mobile, 213546),
      "childrens-books-site" -> PrebidIndexSite(Tablet, 215481),
      "cities" -> PrebidIndexSite(Desktop, 208275),
      "cities" -> PrebidIndexSite(Mobile, 213545),
      "cities" -> PrebidIndexSite(Tablet, 215480),
      "commentisfree" -> PrebidIndexSite(Desktop, 208274),
      "commentisfree" -> PrebidIndexSite(Mobile, 213544),
      "commentisfree" -> PrebidIndexSite(Tablet, 215479),
      "community" -> PrebidIndexSite(Desktop, 208273),
      "community" -> PrebidIndexSite(Mobile, 213543),
      "community" -> PrebidIndexSite(Tablet, 215478),
      "connecting-the-future" -> PrebidIndexSite(Desktop, 208272),
      "connecting-the-future" -> PrebidIndexSite(Mobile, 213542),
      "connecting-the-future" -> PrebidIndexSite(Tablet, 215477),
      "crosswords" -> PrebidIndexSite(Desktop, 208271),
      "crosswords" -> PrebidIndexSite(Mobile, 213541),
      "crosswords" -> PrebidIndexSite(Tablet, 215476),
      "culture" -> PrebidIndexSite(Desktop, 208270),
      "culture" -> PrebidIndexSite(Mobile, 213540),
      "culture" -> PrebidIndexSite(Tablet, 215475),
      "culture-professionals-network" -> PrebidIndexSite(Desktop, 208269),
      "culture-professionals-network" -> PrebidIndexSite(Mobile, 213539),
      "culture-professionals-network" -> PrebidIndexSite(Tablet, 215474),
      "dementia-friends" -> PrebidIndexSite(Desktop, 208268),
      "dementia-friends" -> PrebidIndexSite(Mobile, 213538),
      "dementia-friends" -> PrebidIndexSite(Tablet, 215473),
      "discover-culture" -> PrebidIndexSite(Desktop, 208266),
      "discover-culture" -> PrebidIndexSite(Mobile, 213537),
      "discover-culture" -> PrebidIndexSite(Tablet, 215472),
      "education" -> PrebidIndexSite(Desktop, 208265),
      "education" -> PrebidIndexSite(Mobile, 213536),
      "education" -> PrebidIndexSite(Tablet, 215471),
      "environment" -> PrebidIndexSite(Desktop, 208264),
      "environment" -> PrebidIndexSite(Mobile, 213535),
      "environment" -> PrebidIndexSite(Tablet, 215470),
      "evans-cycles" -> PrebidIndexSite(Desktop, 208263),
      "evans-cycles" -> PrebidIndexSite(Mobile, 213534),
      "evans-cycles" -> PrebidIndexSite(Tablet, 215469),
      "extra" -> PrebidIndexSite(Desktop, 208262),
      "extra" -> PrebidIndexSite(Mobile, 213533),
      "extra" -> PrebidIndexSite(Tablet, 215468),
      "fashion" -> PrebidIndexSite(Desktop, 208261),
      "fashion" -> PrebidIndexSite(Mobile, 213532),
      "fashion" -> PrebidIndexSite(Tablet, 215467),
      "film" -> PrebidIndexSite(Desktop, 208260),
      "film" -> PrebidIndexSite(Mobile, 213531),
      "film" -> PrebidIndexSite(Tablet, 215466),
      "football" -> PrebidIndexSite(Desktop, 208259),
      "football" -> PrebidIndexSite(Mobile, 213530),
      "football" -> PrebidIndexSite(Tablet, 215465),
      "global-development" -> PrebidIndexSite(Desktop, 208256),
      "global-development" -> PrebidIndexSite(Mobile, 213527),
      "global-development" -> PrebidIndexSite(Tablet, 215462),
      "global-development-professionals-network" -> PrebidIndexSite(Desktop, 208255),
      "global-development-professionals-network" -> PrebidIndexSite(Mobile, 213526),
      "global-development-professionals-network" -> PrebidIndexSite(Tablet, 215461),
      "guardian-masterclasses" -> PrebidIndexSite(Desktop, 208252),
      "guardian-masterclasses" -> PrebidIndexSite(Mobile, 213524),
      "guardian-masterclasses" -> PrebidIndexSite(Tablet, 215459),
      "healthcare-network" -> PrebidIndexSite(Desktop, 208251),
      "healthcare-network" -> PrebidIndexSite(Mobile, 213523),
      "healthcare-network" -> PrebidIndexSite(Tablet, 215458),
      "help" -> PrebidIndexSite(Desktop, 208250),
      "help" -> PrebidIndexSite(Mobile, 213522),
      "help" -> PrebidIndexSite(Tablet, 215457),
      "higher-education-network" -> PrebidIndexSite(Desktop, 208249),
      "higher-education-network" -> PrebidIndexSite(Mobile, 213521),
      "higher-education-network" -> PrebidIndexSite(Tablet, 215456),
      "housing-network" -> PrebidIndexSite(Desktop, 208248),
      "housing-network" -> PrebidIndexSite(Mobile, 213520),
      "housing-network" -> PrebidIndexSite(Tablet, 215455),
      "info" -> PrebidIndexSite(Desktop, 208247),
      "info" -> PrebidIndexSite(Mobile, 213519),
      "info" -> PrebidIndexSite(Tablet, 215454),
      "international" -> PrebidIndexSite(Desktop, 208246),
      "international" -> PrebidIndexSite(Mobile, 213518),
      "international" -> PrebidIndexSite(Tablet, 215453),
      "johnnie-walker-joy" -> PrebidIndexSite(Desktop, 208245),
      "johnnie-walker-joy" -> PrebidIndexSite(Mobile, 213517),
      "johnnie-walker-joy" -> PrebidIndexSite(Tablet, 215452),
      "law" -> PrebidIndexSite(Desktop, 208243),
      "law" -> PrebidIndexSite(Mobile, 213516),
      "law" -> PrebidIndexSite(Tablet, 215451),
      "lifeandstyle" -> PrebidIndexSite(Desktop, 208242),
      "lifeandstyle" -> PrebidIndexSite(Mobile, 213515),
      "lifeandstyle" -> PrebidIndexSite(Tablet, 215450),
      "local-government-network" -> PrebidIndexSite(Desktop, 208241),
      "local-government-network" -> PrebidIndexSite(Mobile, 213514),
      "local-government-network" -> PrebidIndexSite(Tablet, 215449),
      "media" -> PrebidIndexSite(Desktop, 208240),
      "media" -> PrebidIndexSite(Mobile, 213513),
      "media" -> PrebidIndexSite(Tablet, 215448),
      "media-network" -> PrebidIndexSite(Desktop, 208239),
      "media-network" -> PrebidIndexSite(Mobile, 213512),
      "media-network" -> PrebidIndexSite(Tablet, 215447),
      "membership" -> PrebidIndexSite(Desktop, 208238),
      "membership" -> PrebidIndexSite(Mobile, 213511),
      "membership" -> PrebidIndexSite(Tablet, 215446),
      "mobile" -> PrebidIndexSite(Desktop, 208237),
      "mobile" -> PrebidIndexSite(Mobile, 213510),
      "mobile" -> PrebidIndexSite(Tablet, 215445),
      "money" -> PrebidIndexSite(Desktop, 208236),
      "money" -> PrebidIndexSite(Mobile, 213509),
      "money" -> PrebidIndexSite(Tablet, 215444),
      "music" -> PrebidIndexSite(Desktop, 208235),
      "music" -> PrebidIndexSite(Mobile, 213508),
      "music" -> PrebidIndexSite(Tablet, 215443),
      "news" -> PrebidIndexSite(Desktop, 208234),
      "news" -> PrebidIndexSite(Mobile, 213507),
      "news" -> PrebidIndexSite(Tablet, 215442),
      "observer" -> PrebidIndexSite(Desktop, 208233),
      "observer" -> PrebidIndexSite(Mobile, 213506),
      "observer" -> PrebidIndexSite(Tablet, 215441),
      "olam-partner-zone" -> PrebidIndexSite(Desktop, 208232),
      "olam-partner-zone" -> PrebidIndexSite(Mobile, 213505),
      "olam-partner-zone" -> PrebidIndexSite(Tablet, 215440),
      "personal-investments" -> PrebidIndexSite(Desktop, 208230),
      "personal-investments" -> PrebidIndexSite(Mobile, 213503),
      "personal-investments" -> PrebidIndexSite(Tablet, 215438),
      "politics" -> PrebidIndexSite(Desktop, 208229),
      "politics" -> PrebidIndexSite(Mobile, 213502),
      "politics" -> PrebidIndexSite(Tablet, 215437),
      "public-leaders-network" -> PrebidIndexSite(Desktop, 208228),
      "public-leaders-network" -> PrebidIndexSite(Mobile, 213501),
      "public-leaders-network" -> PrebidIndexSite(Tablet, 215436),
      "reader-events" -> PrebidIndexSite(Desktop, 208227),
      "reader-events" -> PrebidIndexSite(Mobile, 213500),
      "reader-events" -> PrebidIndexSite(Tablet, 215435),
      "science" -> PrebidIndexSite(Desktop, 208226),
      "science" -> PrebidIndexSite(Mobile, 213499),
      "science" -> PrebidIndexSite(Tablet, 215434),
      "small-business-network" -> PrebidIndexSite(Desktop, 208225),
      "small-business-network" -> PrebidIndexSite(Mobile, 213498),
      "small-business-network" -> PrebidIndexSite(Tablet, 215433),
      "social-care-network" -> PrebidIndexSite(Desktop, 208224),
      "social-care-network" -> PrebidIndexSite(Mobile, 213497),
      "social-care-network" -> PrebidIndexSite(Tablet, 215432),
      "social-care-network-cafcass-partner-zone" -> PrebidIndexSite(Desktop, 208222),
      "social-care-network-cafcass-partner-zone" -> PrebidIndexSite(Mobile, 213496),
      "social-care-network-cafcass-partner-zone" -> PrebidIndexSite(Tablet, 215431),
      "social-enterprise-network" -> PrebidIndexSite(Desktop, 208221),
      "social-enterprise-network" -> PrebidIndexSite(Mobile, 213495),
      "social-enterprise-network" -> PrebidIndexSite(Tablet, 215430),
      "society" -> PrebidIndexSite(Desktop, 208220),
      "society" -> PrebidIndexSite(Mobile, 213494),
      "society" -> PrebidIndexSite(Tablet, 215429),
      "society-professionals" -> PrebidIndexSite(Desktop, 208219),
      "society-professionals" -> PrebidIndexSite(Mobile, 213493),
      "society-professionals" -> PrebidIndexSite(Tablet, 215428),
      "sport" -> PrebidIndexSite(Desktop, 208218),
      "sport" -> PrebidIndexSite(Mobile, 213492),
      "sport" -> PrebidIndexSite(Tablet, 215427),
      "stage" -> PrebidIndexSite(Desktop, 208217),
      "stage" -> PrebidIndexSite(Mobile, 213491),
      "stage" -> PrebidIndexSite(Tablet, 215426),
      "sustainable-business" -> PrebidIndexSite(Desktop, 208216),
      "sustainable-business" -> PrebidIndexSite(Mobile, 213490),
      "sustainable-business" -> PrebidIndexSite(Tablet, 215425),
      "teacher-network" -> PrebidIndexSite(Desktop, 208215),
      "teacher-network" -> PrebidIndexSite(Mobile, 213489),
      "teacher-network" -> PrebidIndexSite(Tablet, 215424),
      "technology" -> PrebidIndexSite(Desktop, 208214),
      "technology" -> PrebidIndexSite(Mobile, 213488),
      "technology" -> PrebidIndexSite(Tablet, 215423),
      "theguardian" -> PrebidIndexSite(Desktop, 208213),
      "theguardian" -> PrebidIndexSite(Mobile, 213487),
      "theguardian" -> PrebidIndexSite(Tablet, 215422),
      "theobserver" -> PrebidIndexSite(Desktop, 208212),
      "theobserver" -> PrebidIndexSite(Mobile, 213486),
      "theobserver" -> PrebidIndexSite(Tablet, 215421),
      "travel" -> PrebidIndexSite(Desktop, 208211),
      "travel" -> PrebidIndexSite(Mobile, 213485),
      "travel" -> PrebidIndexSite(Tablet, 215420),
      "tv-and-radio" -> PrebidIndexSite(Desktop, 208210),
      "tv-and-radio" -> PrebidIndexSite(Mobile, 213484),
      "tv-and-radio" -> PrebidIndexSite(Tablet, 215419),
      "uk" -> PrebidIndexSite(Desktop, 208209),
      "uk" -> PrebidIndexSite(Mobile, 213483),
      "uk" -> PrebidIndexSite(Tablet, 215418),
      "uk-news" -> PrebidIndexSite(Desktop, 208208),
      "uk-news" -> PrebidIndexSite(Mobile, 213482),
      "uk-news" -> PrebidIndexSite(Tablet, 215417),
      "us" -> PrebidIndexSite(Desktop, 208207),
      "us" -> PrebidIndexSite(Mobile, 213481),
      "us" -> PrebidIndexSite(Tablet, 215416),
      "us-news" -> PrebidIndexSite(Desktop, 208206),
      "us-news" -> PrebidIndexSite(Mobile, 213480),
      "us-news" -> PrebidIndexSite(Tablet, 215415),
      "video" -> PrebidIndexSite(Desktop, 208205),
      "video" -> PrebidIndexSite(Mobile, 213479),
      "video" -> PrebidIndexSite(Tablet, 215414),
      "visit-wales" -> PrebidIndexSite(Desktop, 208204),
      "visit-wales" -> PrebidIndexSite(Mobile, 213478),
      "visit-wales" -> PrebidIndexSite(Tablet, 215413),
      "voluntary-sector-network" -> PrebidIndexSite(Desktop, 208203),
      "voluntary-sector-network" -> PrebidIndexSite(Mobile, 213477),
      "voluntary-sector-network" -> PrebidIndexSite(Tablet, 215412),
      "voluntary-sector-network-caf-partner-zone" -> PrebidIndexSite(Desktop, 208202),
      "voluntary-sector-network-caf-partner-zone" -> PrebidIndexSite(Mobile, 213476),
      "voluntary-sector-network-caf-partner-zone" -> PrebidIndexSite(Tablet, 215411),
      "weather" -> PrebidIndexSite(Desktop, 208201),
      "weather" -> PrebidIndexSite(Mobile, 213475),
      "weather" -> PrebidIndexSite(Tablet, 215410),
      "women-in-leadership" -> PrebidIndexSite(Desktop, 208200),
      "women-in-leadership" -> PrebidIndexSite(Mobile, 213474),
      "women-in-leadership" -> PrebidIndexSite(Tablet, 215409),
      "world" -> PrebidIndexSite(Desktop, 204985),
      "world" -> PrebidIndexSite(Mobile, 213473),
      "world" -> PrebidIndexSite(Tablet, 215408),
    ).groupBy { case (section, _) => section }.mapV { _.map { case (_, site) => site }.toSet }

  private def fromSectionId(sectionId: String): Option[Set[PrebidIndexSite]] = {
    val firstPart = {
      val sepIndex = sectionId.indexOf('/')
      if (sepIndex > 0) sectionId.substring(0, sepIndex) else sectionId
    }
    siteIds.get(firstPart).orElse(Some(defaultSiteIds))
  }

  def fromContent(item: Content): Option[Set[PrebidIndexSite]] = item.sectionId.flatMap(fromSectionId)

  def fromSection(section: Section): Option[Set[PrebidIndexSite]] = {
    val id = section.editions.find(_.code == "default").map(_.id).getOrElse(section.id)
    fromSectionId(id)
  }

  def fromTag(tag: Tag): Option[Set[PrebidIndexSite]] = tag.sectionId.flatMap(fromSectionId)

  def forNetworkFront(frontId: String): Option[Set[PrebidIndexSite]] = fromSectionId(frontId)

  def forFrontUnknownToCapi(frontId: String): Option[Set[PrebidIndexSite]] = fromSectionId(frontId)
}
