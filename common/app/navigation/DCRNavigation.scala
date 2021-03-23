package navigation

import navigation.ReaderRevenueSite.{Support, SupportContribute, SupportGifting, SupportSubscribe, SupporterCTA}
import navigation.UrlHelpers._
import play.api.libs.json.{Json, Writes}

case class ReaderRevenueLink(
    contribute: String,
    subscribe: String,
    support: String,
    supporter: String,
)

object ReaderRevenueLink {
  implicit val writes = Json.writes[ReaderRevenueLink]
}

case class ReaderRevenueLinks(
    header: ReaderRevenueLink,
    footer: ReaderRevenueLink,
    sideMenu: ReaderRevenueLink,
    ampHeader: ReaderRevenueLink,
    ampFooter: ReaderRevenueLink,
)

object ReaderRevenueLinks {
  implicit val writes = Json.writes[ReaderRevenueLinks]

  val headerReaderRevenueLink: ReaderRevenueLink = ReaderRevenueLink(
    getReaderRevenueUrl(SupportContribute, Header),
    getReaderRevenueUrl(SupportSubscribe, Header),
    getReaderRevenueUrl(Support, Header),
    getReaderRevenueUrl(SupporterCTA, Header),
  )

  val footerReaderRevenueLink: ReaderRevenueLink = ReaderRevenueLink(
    getReaderRevenueUrl(SupportContribute, Footer),
    getReaderRevenueUrl(SupportSubscribe, Footer),
    getReaderRevenueUrl(Support, Footer),
    getReaderRevenueUrl(SupporterCTA, Footer)
  )

  val sideMenuReaderRevenueLink: ReaderRevenueLink = ReaderRevenueLink(
    getReaderRevenueUrl(SupportContribute, SideMenu),
    getReaderRevenueUrl(SupportSubscribe, SideMenu),
    getReaderRevenueUrl(Support, SideMenu),
    getReaderRevenueUrl(SupporterCTA, SideMenu),
  )

  val ampHeaderReaderRevenueLink: ReaderRevenueLink = ReaderRevenueLink(
    getReaderRevenueUrl(SupportContribute, AmpHeader),
    getReaderRevenueUrl(SupportSubscribe, AmpHeader),
    getReaderRevenueUrl(Support, AmpHeader),
    getReaderRevenueUrl(SupporterCTA, AmpHeader),
  )

  val ampFooterReaderRevenueLink: ReaderRevenueLink = ReaderRevenueLink(
    getReaderRevenueUrl(SupportContribute, AmpFooter),
    getReaderRevenueUrl(SupportSubscribe, AmpFooter),
    getReaderRevenueUrl(Support, AmpFooter),
    getReaderRevenueUrl(SupporterCTA, AmpFooter),
  )

  val all = ReaderRevenueLinks(
    headerReaderRevenueLink,
    footerReaderRevenueLink,
    sideMenuReaderRevenueLink,
    ampHeaderReaderRevenueLink,
    ampFooterReaderRevenueLink,
  )
}

case class Nav(
    currentUrl: String,
    pillars: Seq[NavLink],
    otherLinks: Seq[NavLink],
    brandExtensions: Seq[NavLink],
    currentNavLinkTitle: Option[String],
    currentPillarTitle: Option[String],
    subNavSections: Option[Subnav],
    readerRevenueLinks: ReaderRevenueLinks,
)

object Nav {
  implicit val flatSubnavWrites = Json.writes[FlatSubnav]
  implicit val parentSubnavWrites = Json.writes[ParentSubnav]
  implicit val subnavWrites = Writes[Subnav] {
    case nav: FlatSubnav   => flatSubnavWrites.writes(nav)
    case nav: ParentSubnav => parentSubnavWrites.writes(nav)
  }

  implicit val writes = Json.writes[Nav]
}
