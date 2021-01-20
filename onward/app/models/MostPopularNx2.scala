package models

import com.github.nscala_time.time.Imports.DateTimeZone
import common.{Edition, LinkTo}
import feed.DeeplyReadItem
import model.pressed.PressedContent
import play.api.mvc.RequestHeader
import views.support.{ContentOldAgeDescriber, ImgSrc, RemoveOuterParaHtml}
import play.api.libs.json._
import implicits.FaciaContentFrontendHelpers._
import layout.ContentCard
import model.{Article, InlineImage, MostPopular, Pillar}
import models.dotcomponents.OnwardsUtils.{correctPillar, determinePillar}

case class OnwardItemNx2(
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
    shortUrl: String,
    kickerText: Option[String],
    starRating: Option[Int],
    avatarUrl: Option[String],
)

object OnwardItemNx2 {

  implicit val onwardItemWrites = Json.writes[OnwardItemNx2]

  private def contentCardToAvatarUrl(contentCard: ContentCard): Option[String] = {

    val maybeUrl1 = if (contentCard.cardTypes.showCutOut) {
      contentCard.cutOut.map { cutOut => cutOut.imageUrl }
    } else {
      None
    }

    val maybeUrl2 = contentCard.displayElement.flatMap { faciaDisplayElement =>
      faciaDisplayElement match {
        case InlineImage(imageMedia) => ImgSrc.getFallbackUrl(imageMedia)
        case _                       => None
      }
    }

    maybeUrl1 match {
      case Some(_) => maybeUrl1
      case None    => maybeUrl2
    }

  }
  def contentCardToOnwardItemNx2(contentCard: ContentCard): Option[OnwardItemNx2] = {
    for {
      properties <- contentCard.properties
      maybeContent <- properties.maybeContent
      metadata = maybeContent.metadata
      pillar <- metadata.pillar
      url <- properties.webUrl
      headline = contentCard.header.headline
      isLiveBlog = properties.isLiveBlog
      showByline = properties.showByline
      webPublicationDate <- contentCard.webPublicationDate.map(x => x.toDateTime().toString())
      shortUrl <- contentCard.shortUrl
    } yield OnwardItemNx2(
      url = url,
      linkText = "",
      showByline = showByline,
      byline = contentCard.byline.map(x => x.get),
      image = maybeContent.trail.thumbnailPath,
      ageWarning = None,
      isLiveBlog = isLiveBlog,
      pillar = correctPillar(pillar.toString.toLowerCase),
      designType = metadata.designType.toString,
      webPublicationDate = webPublicationDate,
      headline = headline,
      mediaType = contentCard.mediaType.map(x => x.toString),
      shortUrl = shortUrl,
      kickerText = contentCard.header.kicker.flatMap(_.properties.kickerText),
      starRating = contentCard.starRating,
      avatarUrl = contentCardToAvatarUrl(contentCard),
    )
  }

  def pressedContentToOnwardItemNx2(content: PressedContent)(implicit
      request: RequestHeader,
  ): OnwardItemNx2 = {

    def pillarToString(pillar: Pillar): String = {
      pillar.toString.toLowerCase() match {
        case "arts" => "culture"
        case other  => other
      }
    }

    OnwardItemNx2(
      url = LinkTo(content.header.url),
      linkText = RemoveOuterParaHtml(content.properties.linkText.getOrElse(content.header.headline)).body,
      showByline = content.properties.showByline,
      byline = content.properties.byline,
      image = content.trailPicture.flatMap(ImgSrc.getFallbackUrl),
      ageWarning = content.ageWarning,
      isLiveBlog = content.properties.isLiveBlog,
      pillar = content.maybePillar.map(pillarToString).getOrElse("news"),
      designType = content.properties.maybeContent.map(_.metadata.designType).getOrElse(Article).toString,
      webPublicationDate = content.webPublicationDate.withZone(DateTimeZone.UTC).toString,
      headline = content.header.headline,
      mediaType = content.card.mediaType.map(_.toString()),
      shortUrl = content.card.shortUrl,
      kickerText = content.header.kicker.flatMap(_.properties.kickerText),
      starRating = content.card.starRating,
      avatarUrl = None,
    )
  }
}

case class OnwardCollectionResponse(
    heading: String,
    trails: Seq[OnwardItemNx2],
)
object OnwardCollectionResponse {
  implicit val collectionWrites = Json.writes[OnwardCollectionResponse]
}

case class OnwardCollectionResponseDCR(
    tabs: Seq[OnwardCollectionResponse],
    mostCommented: Option[OnwardItemNx2],
    mostShared: Option[OnwardItemNx2],
)
object OnwardCollectionResponseDCR {
  implicit val onwardCollectionResponseForDRCWrites = Json.writes[OnwardCollectionResponseDCR]
}

case class MostPopularGeoResponse(
    country: Option[String],
    heading: String,
    trails: Seq[OnwardItemNx2],
)
object MostPopularGeoResponse {
  implicit val popularGeoWrites = Json.writes[MostPopularGeoResponse]
}

// MostPopularNx2 was introduced to replace the less flexible [common] MostPopular
// which is heavily relying on pressed.PressedContent
// because we want to be able to create MostPopularNx2 from trails coming from the DeeplyReadAgent
case class MostPopularNx2(heading: String, section: String, trails: Seq[OnwardItemNx2])

object MostPopularNx2 {
  implicit val mostPopularNx2Writes = Json.writes[MostPopularNx2]
}
