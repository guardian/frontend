package model.dotcomrendering

import common.commercial.{CommercialProperties, EditionCommercialProperties, PrebidIndexSite}
import model.dotcomrendering.pageElements.PageElement
import navigation._
import play.api.libs.functional.syntax.toFunctionalBuilderOps
import play.api.libs.json._

// We have introduced our own set of objects for serializing data to the DotComponents API,
// because we don't want people changing the core frontend models and as a side effect,
// making them incompatible with Dotcomponents. By having our own set of models, there's
// only one reason for change.
// Exceptions: we do reuse the existing Nav & BlockElement classes right now

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
    blockCreatedOn: Option[Long],
    blockCreatedOnDisplay: Option[String],
    blockLastUpdated: Option[Long],
    blockLastUpdatedDisplay: Option[String],
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

case class PageFooter(
    footerLinks: Seq[Seq[FooterLink]],
)

object PageFooter {
  implicit val footerLinkWrites: Writes[FooterLink] = Json.writes[FooterLink]
  implicit val writes = Json.writes[PageFooter]
}
