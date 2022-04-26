package model.dotcomrendering

import com.gu.contentapi.client.model.v1.{Block => APIBlock}
import com.gu.contentapi.client.utils.format.ImmersiveDisplay
import common.Edition
import common.commercial.{CommercialProperties, EditionCommercialProperties, PrebidIndexSite}
import model.dotcomrendering.pageElements.PageElement
import model.{ArticleDateTimes, ContentPage, GUDateTimeFormatNew}
import navigation._
import org.joda.time.DateTime
import play.api.libs.json._
import play.api.mvc.RequestHeader
import views.support.{ImgSrc, Item140, Item300}

// We have introduced our own set of objects for serializing data to the DotComponents API,
// because we don't want people changing the core frontend models and as a side effect,
// making them incompatible with Dotcomponents. By having our own set of models, there's
// only one reason for change.
// Exceptions: we do reuse the existing Nav & BlockElement classes right now

case class Tag(
    id: String,
    `type`: String,
    title: String,
    twitterHandle: Option[String],
    bylineImageUrl: Option[String],
    isLargeBylineImage: Option[Boolean],
)

case class BylineImage(imageUrl: String, isLargeImage: Boolean)

object Tag {
  implicit val writes = Json.writes[Tag]

  def apply(t: model.Tag): Tag = {

    // We are creating a fallback for small byline images because some contributors have not yet had
    // larger images taken and uploaded. Once that's done, the aim is to remove the fallback and only use large images.
    val bylineImage: Option[BylineImage] =
      t.properties.contributorLargeImagePath match {
        case Some(bylineLargeImage) =>
          Some(BylineImage(imageUrl = ImgSrc(bylineLargeImage, Item300), isLargeImage = true))
        case None =>
          t.contributorImagePath.map(bylineSmallImage =>
            BylineImage(imageUrl = ImgSrc(bylineSmallImage, Item140), isLargeImage = false),
          )
      }

    Tag(
      t.id,
      t.properties.tagType,
      t.properties.webTitle,
      t.properties.twitterHandle,
      bylineImage.map(_.imageUrl),
      bylineImage.map(_.isLargeImage),
    )
  }
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
    blockFirstPublishedDisplayNoTimezone: Option[String],
    title: Option[String],
    contributors: Seq[Contributor],
    primaryDateLine: String,
    secondaryDateLine: String,
)

object Block {
  implicit val pageElementWrites = PageElement.pageElementWrites
  implicit val writes = Json.writes[Block]

  // TODO simplify date fields when DCR is ready
  def apply(
      block: APIBlock,
      page: ContentPage,
      shouldAddAffiliateLinks: Boolean,
      request: RequestHeader,
      isMainBlock: Boolean,
      calloutsUrl: Option[String],
      dateTimes: ArticleDateTimes,
      tags: Seq[Tag],
  ): Block = {

    val content = page.item

    // We are passing through the block data here, not the article
    // the block dateTime types are used for liveblogs
    val blockCreatedOn = block.createdDate.map(_.dateTime)
    val blockCreatedOnDisplay =
      blockCreatedOn.map(dt => GUDateTimeFormatNew.formatTimeForDisplay(new DateTime(dt), request))

    val blockFirstPublished = block.firstPublishedDate.map(_.dateTime)
    val blockFirstPublishedDisplay =
      blockFirstPublished.map(dt => GUDateTimeFormatNew.formatTimeForDisplay(new DateTime(dt), request))
    val blockFirstPublishedDisplayNoTimezone =
      blockFirstPublished.map(dt => GUDateTimeFormatNew.formatTimeForDisplayNoTimezone(new DateTime(dt), request))

    val blockLastUpdated = block.lastModifiedDate.map(_.dateTime)
    val blockLastUpdatedDisplay =
      blockLastUpdated.map(dt => GUDateTimeFormatNew.formatTimeForDisplay(new DateTime(dt), request))

    val displayedDateTimes = ArticleDateTimes.makeDisplayedDateTimesDCR(dateTimes, request)
    val campaigns = page.getJavascriptConfig.get("campaigns")

    val contributors = block.contributors flatMap { contributorId =>
      tags.find(_.id == s"profile/$contributorId").map(tag => Contributor(tag.title, tag.bylineImageUrl))
    }

    Block(
      id = block.id,
      elements = DotcomRenderingUtils.blockElementsToPageElements(
        block.elements,
        request,
        content,
        shouldAddAffiliateLinks,
        isMainBlock,
        content.metadata.format.exists(_.display == ImmersiveDisplay),
        campaigns,
        calloutsUrl,
      ),
      blockCreatedOn = blockCreatedOn,
      blockCreatedOnDisplay = blockCreatedOnDisplay,
      blockLastUpdated = blockLastUpdated,
      blockLastUpdatedDisplay = blockLastUpdatedDisplay,
      title = block.title,
      contributors = contributors,
      blockFirstPublished = blockFirstPublished,
      blockFirstPublishedDisplay = blockFirstPublishedDisplay,
      blockFirstPublishedDisplayNoTimezone = blockFirstPublishedDisplayNoTimezone,
      primaryDateLine = displayedDateTimes.primaryDateLine,
      secondaryDateLine = displayedDateTimes.secondaryDateLine,
    )
  }
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
