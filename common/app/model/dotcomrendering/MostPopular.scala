package model.dotcomrendering

import com.github.nscala_time.time.Imports.DateTimeZone
import com.gu.commercial.branding.{Branding, BrandingType, Logo => CommercialLogo, Dimensions}
import common.{Edition, LinkTo}
import play.api.mvc.RequestHeader
import views.support.{ImageProfile, ImgSrc, Item300, Item460, RemoveOuterParaHtml}
import play.api.libs.json._
import implicits.FaciaContentFrontendHelpers._
import layout.ContentCard
import model.{Article, ContentFormat, ImageMedia, InlineImage, Pillar}
import model.pressed.PressedContent

case class OnwardItem(
    url: String,
    linkText: String,
    showByline: Boolean,
    byline: Option[String],
    image: Option[String],
    carouselImages: Map[String, Option[String]],
    ageWarning: Option[String],
    isLiveBlog: Boolean,
    pillar: String,
    designType: String,
    format: ContentFormat,
    webPublicationDate: String,
    headline: String,
    mediaType: Option[String],
    shortUrl: String,
    kickerText: Option[String],
    starRating: Option[Int],
    avatarUrl: Option[String],
    branding: Option[Branding],
)

object OnwardItem {

  implicit val brandingTypeWrites = new Writes[BrandingType] {
    def writes(bt: BrandingType) = {
      Json.obj(
        "name" -> bt.name,
      )
    }
  }

  implicit val dimensionsWrites = Json.writes[Dimensions]

  implicit val logoWrites = Json.writes[CommercialLogo]

  implicit val brandingWrites = Json.writes[Branding]

  implicit val OnwardItemWrites = Json.writes[OnwardItem]

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

  // We ideally want this to be replaced by something else in the near future. Probably
  // image-rendering or similar. But this will do for now.
  // TODO: Replace this.

  def getImageSources(imageMedia: Option[ImageMedia]): Map[String, Option[String]] = {
    val images = for {
      profile: ImageProfile <- List(Item300, Item460)
      width: Int <- profile.width
      trailPicture: ImageMedia <- imageMedia
    } yield {
      width.toString -> profile.bestSrcFor(trailPicture)
    }
    images.toMap
  }

  def contentCardToOnwardItem(contentCard: ContentCard): Option[OnwardItem] = {
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
      carouselImages = getImageSources(maybeContent.trail.trailPicture),
      ageWarning = None,
      isLiveBlog = isLiveBlog,
      pillar = OnwardsUtils.normalisePillar(Some(pillar)),
      designType = metadata.designType.toString,
      format = metadata.format.getOrElse(ContentFormat.defaultContentFormat),
      webPublicationDate = webPublicationDate,
      headline = headline,
      mediaType = contentCard.mediaType.map(x => x.toString),
      shortUrl = shortUrl,
      kickerText = contentCard.header.kicker.flatMap(_.properties.kickerText),
      starRating = contentCard.starRating,
      avatarUrl = contentCardToAvatarUrl(contentCard),
      branding = contentCard.branding,
    )
  }

  def pressedContentToOnwardItem(content: PressedContent)(implicit
      request: RequestHeader,
  ): OnwardItem = {

    def pillarToString(pillar: Pillar): String = {
      pillar.toString.toLowerCase() match {
        case "arts" => "culture"
        case other  => other
      }
    }
    OnwardItem(
      url = LinkTo(content.header.url),
      linkText = RemoveOuterParaHtml(content.properties.linkText.getOrElse(content.header.headline)).body,
      showByline = content.properties.showByline,
      byline = content.properties.byline,
      image = content.trailPicture.flatMap(ImgSrc.getFallbackUrl),
      carouselImages = getImageSources(content.trailPicture),
      ageWarning = content.ageWarning,
      isLiveBlog = content.properties.isLiveBlog,
      pillar = content.maybePillar.map(pillarToString).getOrElse("news"),
      designType = content.properties.maybeContent.map(_.metadata.designType).getOrElse(Article).toString,
      format = content.format.getOrElse(ContentFormat.defaultContentFormat),
      webPublicationDate = content.webPublicationDate.withZone(DateTimeZone.UTC).toString,
      headline = content.header.headline,
      mediaType = content.card.mediaType.map(_.toString()),
      shortUrl = content.card.shortUrl,
      kickerText = content.header.kicker.flatMap(_.properties.kickerText),
      starRating = content.card.starRating,
      avatarUrl = None,
      branding = content.branding(Edition(request)),
    )
  }
}

case class OnwardCollectionResponse(
    heading: String,
    trails: Seq[OnwardItem],
)
object OnwardCollectionResponse {
  implicit val collectionWrites = Json.writes[OnwardCollectionResponse]
}

case class OnwardCollectionResponseDCR(
    tabs: Seq[OnwardCollectionResponse],
    mostCommented: Option[OnwardItem],
    mostShared: Option[OnwardItem],
)
object OnwardCollectionResponseDCR {
  implicit val onwardCollectionResponseForDRCWrites = Json.writes[OnwardCollectionResponseDCR]
}

case class MostPopularGeoResponse(
    country: Option[String],
    heading: String,
    trails: Seq[OnwardItem],
)
object MostPopularGeoResponse {
  implicit val popularGeoWrites = Json.writes[MostPopularGeoResponse]
}

/**
  * `MostPopularOnward** was introduced to replace the less flexible [common] `MostPopular`,
  * which is heavily relying on `pressed.PressedContent`,
  * because we want to be able to create MostPopularOnward from trails coming from the `DeeplyReadAgent`
  */
case class MostPopularOnward(heading: String, section: String, trails: Seq[OnwardItem])
object MostPopularOnward {
  implicit val mostPopularOnwardWrites = Json.writes[MostPopularOnward]
}

object OnwardsUtils {
  def normalisePillar(pillar: Option[Pillar]): String =
    pillar match {
      case Some(Pillar("arts")) => "culture"
      case Some(Pillar(p))      => p
      case None                 => "news"
    }
}
