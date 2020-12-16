package model.dotcomrendering

import common.commercial.{CommercialProperties, EditionCommercialProperties, PrebidIndexSite}
import model.dotcomrendering.pageElements.PageElement
import navigation.{FlatSubnav, NavLink, ParentSubnav, Subnav}
import navigation.FooterLink
import play.api.libs.json._

// We have introduced our own set of objects for serializing data to the DotComponents API,
// because we don't want people changing the core frontend models and as a side effect,
// making them incompatible with Dotcomponents. By having our own set of models, there's
// only one reason for change.
// exceptions: we do resuse the existing Nav & BlockElement classes right now

// -----------------------------------------------------------------
// Supporting Types
// -----------------------------------------------------------------

case class Tag(
    id: String,
    `type`: String,
    title: String,
    twitterHandle: Option[String],
    bylineImageUrl: Option[String],
)

object Tag {
  implicit val writes = Json.writes[Tag]
}

case class Block(
    id: String,
    elements: List[PageElement],
    createdOn: Option[Long],
    createdOnDisplay: Option[String],
    blockCreatedOn: Option[Long],
    blockCreatedOnDisplay: Option[String],
    lastUpdated: Option[Long],
    lastUpdatedDisplay: Option[String],
    blockLastUpdated: Option[Long],
    blockLastUpdatedDisplay: Option[String],
    firstPublished: Option[Long],
    firstPublishedDisplay: Option[String],
    blockFirstPublished: Option[Long],
    blockFirstPublishedDisplay: Option[String],
    title: Option[String],
    primaryDateLine: String,
    secondaryDateLine: String,
)

object Block {
  implicit val pageElementWrites = PageElement.pageElementWrites
  implicit val writes = Json.writes[Block]
}

case class Pagination(
    currentPage: Int,
    totalPages: Int,
    newest: Option[String],
    newer: Option[String],
    oldest: Option[String],
    older: Option[String],
)

object Pagination {
  implicit val writes = Json.writes[Pagination]
}

case class ReaderRevenueLink(
    contribute: String,
    subscribe: String,
    support: String,
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
}

case class Commercial(
    editionCommercialProperties: Map[String, EditionCommercialProperties],
    prebidIndexSites: List[PrebidIndexSite],
    commercialProperties: Option[CommercialProperties],
    pageType: PageType,
)

object Commercial {
  implicit val writes = Json.writes[Commercial]
}

case class Config(
    switches: Map[String, Boolean],
    abTests: Map[String, String],
    commercialBundleUrl: String,
    googletagUrl: String,
    stage: String,
    frontendAssetsFullURL: String,
    ampIframeUrl: String,
)

object Config {
  implicit val writes = Json.writes[Config]
}

case class SubMetaLink(
    url: String,
    title: String,
)

object SubMetaLink {
  implicit val format = Json.format[SubMetaLink]

  def apply(sml: model.SubMetaLink): SubMetaLink = {
    SubMetaLink(
      url = sml.link,
      title = sml.text,
    )
  }
}

case class Author(
    byline: Option[String],
    twitterHandle: Option[String],
)

object Author {
  implicit val writes = Json.writes[Author]
}

case class DCRBadge(seriesTag: String, imageUrl: String)

object DCRBadge {
  implicit val writes = Json.writes[DCRBadge]
}

case class Nav(
    currentUrl: String,
    pillars: Seq[NavLink],
    otherLinks: Seq[NavLink],
    brandExtensions: Seq[NavLink],
    currentNavLink: Option[NavLink],
    currentParent: Option[NavLink],
    currentPillar: Option[NavLink],
    subNavSections: Option[Subnav],
    readerRevenueLinks: ReaderRevenueLinks,
)

object Nav {
  implicit val navlinkWrites = Json.writes[NavLink]
  implicit val flatSubnavWrites = Json.writes[FlatSubnav]
  implicit val parentSubnavWrites = Json.writes[ParentSubnav]
  implicit val subnavWrites = Writes[Subnav] {
    case nav: FlatSubnav   => flatSubnavWrites.writes(nav)
    case nav: ParentSubnav => parentSubnavWrites.writes(nav)
  }
  implicit val writes = Json.writes[Nav]
}

case class PageFooter(
    footerLinks: Seq[Seq[FooterLink]],
)

object PageFooter {
  implicit val footerLinkWrites: Writes[FooterLink] = Json.writes[FooterLink]
  implicit val writes = Json.writes[PageFooter]
}
