package models

import com.gu.contentapi.client.utils.{Article, DesignType}
import common.LinkTo
import model.pressed.{Image, MediaType, PressedContent}
import play.api.mvc.RequestHeader
import views.support.{ContentOldAgeDescriber, GUDateTimeFormat, ImgSrc, RemoveOuterParaHtml}
import play.api.libs.json._
import implicits.FaciaContentFrontendHelpers._
import layout.ContentCard
import model.InlineImage
import models.dotcomponents.OnwardsUtils.{determinePillar, correctPillar}
import org.joda.time.DateTimeZone

case class OnwardItem(
  url: String,
  linkText: String,
  showByline: Boolean,
  byline: Option[String],
  image: Option[String],
  ageWarning: Option[String],
  isLiveBlog: Boolean,
  pillar: String,
  designType: String,
  webPublicationDate: String,
  headline: String,
  mediaType: Option[String],
  shortUrl: String
)

// OnwardItemMost was introduced only to be the type of mostCommentedAndMostShared in OnwardCollectionForDCRv2
// The only difference between OnwardItem and OnwardItemMost
// is that the image is optional in OnwardItem but not in OnwardItemMost

case class OnwardItemMost(
  designType: String,
  pillar: String,
  url: String,
  headline: String,
  isLiveBlog: Boolean,
  linkText: String,
  showByline: Boolean,
  byline: Option[String],
  image: String,
  webPublicationDate: String,
  ageWarning: Option[String],
  mediaType: Option[String],
  avatarUrl: Option[String],
)

object OnwardItemMost {

  def contentCardToAvatarUrl(contentCard: ContentCard): Option[String] = {
    contentCard.displayElement.flatMap{ faciaDisplayElement => faciaDisplayElement match {
      case InlineImage(imageMedia) => ImgSrc.getFallbackUrl(imageMedia)
      case _ => None
    }}
  }
  def maybeFromContentCard(contentCard: ContentCard): Option[OnwardItemMost] = {
    for {
      properties <- contentCard.properties
      maybeContent <- properties.maybeContent
      metadata = maybeContent.metadata
      pillar <- metadata.pillar
      url <- properties.webUrl
      headline = contentCard.header.headline
      isLiveBlog = properties.isLiveBlog
      showByline = properties.showByline
      image <- maybeContent.trail.thumbnailPath
      webPublicationDate <- contentCard.webPublicationDate.map( x => x.toDateTime().toString() )
    } yield OnwardItemMost(
      designType = metadata.designType.toString,
      pillar = correctPillar(pillar.toString.toLowerCase),
      url = url,
      headline = headline,
      isLiveBlog = isLiveBlog,
      linkText = "",
      showByline = showByline,
      byline = contentCard.byline.map( x => x.get ),
      image = image,
      webPublicationDate = webPublicationDate,
      ageWarning = None,
      mediaType = contentCard.mediaType.map( x => x.toString ),
      avatarUrl = contentCardToAvatarUrl(contentCard),
    )
  }
}

case class MostPopularGeoResponse(
  country: Option[String],
  heading: String,
  trails: Seq[OnwardItem]
)

case class OnwardCollectionResponse(
  heading: String,
  trails: Seq[OnwardItem]
)

case class OnwardCollectionForDCRv2(
  tabs: Seq[OnwardCollectionResponse],
  mostCommented: Option[OnwardItemMost],
  mostShared: Option[OnwardItemMost]
)

object OnwardCollection {

  implicit val onwardItemWrites = Json.writes[OnwardItem]
  implicit val onwardItemMostWrites = Json.writes[OnwardItemMost]
  implicit val popularGeoWrites = Json.writes[MostPopularGeoResponse]
  implicit val collectionWrites = Json.writes[OnwardCollectionResponse]
  implicit val onwardCollectionResponseForDRCv2Writes = Json.writes[OnwardCollectionForDCRv2]

  def trailsToItems(trails: Seq[PressedContent])(implicit request: RequestHeader): Seq[OnwardItem] = {
    def ageWarning(content: PressedContent): Option[String] = {
      content.properties.maybeContent
        .filter(c => c.tags.tags.exists(_.id == "tone/news"))
        .map(ContentOldAgeDescriber.apply)
        .filterNot(_ == "")
    }
    trails.take(10).map(content =>
      OnwardItem(
        url = LinkTo(content.header.url),
        linkText = RemoveOuterParaHtml(content.properties.linkText.getOrElse(content.header.headline)).body,
        showByline = content.properties.showByline,
        byline = content.properties.byline,
        image = content.trailPicture.flatMap(ImgSrc.getFallbackUrl),
        ageWarning = ageWarning(content),
        isLiveBlog = content.properties.isLiveBlog,
        pillar = determinePillar(content.maybePillar),
        designType = content.properties.maybeContent.map(_.metadata.designType).getOrElse(Article).toString,
        webPublicationDate = content.webPublicationDate.withZone(DateTimeZone.UTC).toString,
        headline = content.header.headline,
        mediaType = content.card.mediaType.map(_.toString()),
        shortUrl = content.card.shortUrl,
      )
    )
  }
}
