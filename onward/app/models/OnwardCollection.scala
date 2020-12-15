package models

import com.gu.contentapi.client.utils.Article
import common.LinkTo
import feed.DeeplyReadItem
import model.pressed.PressedContent
import play.api.mvc.RequestHeader
import views.support.{ContentOldAgeDescriber, ImgSrc, RemoveOuterParaHtml}
import play.api.libs.json._
import implicits.FaciaContentFrontendHelpers._
import layout.ContentCard
import model.{InlineImage, MostPopular}
import models.dotcomponents.OnwardsUtils.{correctPillar, determinePillar}
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
    shortUrl: String,
    kickerText: Option[String],
    starRating: Option[Int],
    avatarUrl: Option[String],
)

object OnwardItem {

  def contentCardToAvatarUrl(contentCard: ContentCard): Option[String] = {

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
  def maybeFromContentCard(contentCard: ContentCard): Option[OnwardItem] = {
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
    } yield OnwardItem(
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
}

case class MostPopularGeoResponse(
    country: Option[String],
    heading: String,
    trails: Seq[OnwardItem],
)

case class OnwardCollectionResponse(
    heading: String,
    trails: Seq[OnwardItem],
)

case class OnwardCollectionForDCRv2(
    tabs: Seq[OnwardCollectionResponse],
    mostCommented: Option[OnwardItem],
    mostShared: Option[OnwardItem],
)

object OnwardCollection {

  implicit val onwardItemWrites = Json.writes[OnwardItem]
  implicit val popularGeoWrites = Json.writes[MostPopularGeoResponse]
  implicit val collectionWrites = Json.writes[OnwardCollectionResponse]
  implicit val onwardCollectionResponseForDRCv2Writes = Json.writes[OnwardCollectionForDCRv2]

  def trailsToItems(trails: Seq[PressedContent])(implicit request: RequestHeader): Seq[OnwardItem] = {
    trails
      .take(10)
      .map(content =>
        OnwardItem(
          url = LinkTo(content.header.url),
          linkText = RemoveOuterParaHtml(content.properties.linkText.getOrElse(content.header.headline)).body,
          showByline = content.properties.showByline,
          byline = content.properties.byline,
          image = content.trailPicture.flatMap(ImgSrc.getFallbackUrl),
          ageWarning = content.ageWarning,
          isLiveBlog = content.properties.isLiveBlog,
          pillar = determinePillar(content.maybePillar),
          designType = content.properties.maybeContent.map(_.metadata.designType).getOrElse(Article).toString,
          webPublicationDate = content.webPublicationDate.withZone(DateTimeZone.UTC).toString,
          headline = content.header.headline,
          mediaType = content.card.mediaType.map(_.toString()),
          shortUrl = content.card.shortUrl,
          kickerText = content.header.kicker.flatMap(_.properties.kickerText),
          starRating = content.card.starRating,
          avatarUrl = None,
        ),
      )
  }
}

// MostPopularNx2 was introduced to replace the less flexible [common] MostPopular
// which is heavily replying on pressed.PressedContent
case class MostPopularNx2(heading: String, section: String, trails: Seq[OnwardItem])
