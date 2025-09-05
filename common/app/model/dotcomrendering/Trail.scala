package model.dotcomrendering

import com.github.nscala_time.time.Imports.DateTimeZone
import com.gu.commercial.branding.{Branding, BrandingType, Dimensions, Logo => CommercialLogo}
import common.{Edition, LinkTo}
import implicits.FaciaContentFrontendHelpers.FaciaContentFrontendHelper
import layout.{ContentCard, DiscussionSettings}
import model.dotcomrendering.DotcomRenderingUtils.withoutNull
import model.{Article, ContentFormat, ImageMedia, InlineImage, Pillar}
import model.pressed.PressedContent
import play.api.libs.json.{Json, OWrites, Writes}
import play.api.mvc.RequestHeader
import views.support.{ImageProfile, ImgSrc, Item300, Item460, RemoveOuterParaHtml}

case class Trail(
    url: String,
    linkText: String,
    showByline: Boolean,
    byline: Option[String],
    masterImage: Option[String],
    image: Option[String], // TODO: This can be deprecated after 'masterImage' is supported in DCR
    carouselImages: Map[String, Option[String]], // TODO: This can be deprecated after 'masterImage' is supported in DCR
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
    discussion: DiscussionSettings,
    trailText: Option[String],
    galleryCount: Option[Int],
)

object Trail {

  implicit val brandingTypeWrites: Writes[BrandingType] = new Writes[BrandingType] {
    def writes(bt: BrandingType) = {
      Json.obj(
        "name" -> bt.name,
      )
    }
  }

  implicit val dimensionsWrites: OWrites[Dimensions] = Json.writes[Dimensions]

  implicit val logoWrites: OWrites[CommercialLogo] = Json.writes[CommercialLogo]

  implicit val brandingWrites: OWrites[Branding] = Json.writes[Branding]

  implicit val discussionWrites: OWrites[DiscussionSettings] = Json.writes[DiscussionSettings]

  implicit val OnwardItemWrites: Writes[Trail] = Writes { trail =>
    val jsObject = Json.obj(
      "url" -> trail.url,
      "linkText" -> trail.linkText,
      "showByline" -> trail.showByline,
      "byline" -> trail.byline,
      "masterImage" -> trail.masterImage,
      "image" -> trail.image,
      "carouselImages" -> trail.carouselImages,
      "ageWarning" -> trail.ageWarning,
      "isLiveBlog" -> trail.isLiveBlog,
      "pillar" -> trail.pillar,
      "designType" -> trail.designType,
      "format" -> trail.format,
      "webPublicationDate" -> trail.webPublicationDate,
      "headline" -> trail.headline,
      "mediaType" -> trail.mediaType,
      "shortUrl" -> trail.shortUrl,
      "kickerText" -> trail.kickerText,
      "starRating" -> trail.starRating,
      "avatarUrl" -> trail.avatarUrl,
      "branding" -> trail.branding,
      "discussion" -> trail.discussion,
      "trailText" -> trail.trailText,
      "galleryCount" -> trail.galleryCount,
    )

    withoutNull(jsObject)
  }

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

  def getMasterUrl(imageMedia: Option[ImageMedia]): Option[String] =
    for {
      trailPicture <- imageMedia
      masterImage <- trailPicture.masterImage
      url <- masterImage.url
    } yield url

  def pressedContentToTrail(content: PressedContent)(implicit
      request: RequestHeader,
  ): Trail = {

    def pillarToString(pillar: Pillar): String = {
      pillar.toString.toLowerCase() match {
        case "arts" => "culture"
        case other  => other
      }
    }
    Trail(
      url = LinkTo(content.header.url),
      linkText = RemoveOuterParaHtml(content.properties.linkText.getOrElse(content.header.headline)).body,
      showByline = content.properties.showByline,
      byline = content.properties.byline,
      masterImage = getMasterUrl(content.trailPicture),
      image = content.trailPicture.flatMap(ImgSrc.getFallbackUrl),
      carouselImages = getImageSources(content.trailPicture),
      ageWarning = content.ageWarning,
      isLiveBlog = content.properties.isLiveBlog,
      pillar = content.maybePillar.map(pillarToString).getOrElse("news"),
      designType = content.properties.maybeContent.map(_.metadata.designType).getOrElse(Article).toString,
      format = content.format,
      webPublicationDate = content.webPublicationDate.withZone(DateTimeZone.UTC).toString,
      headline = content.header.headline,
      mediaType = content.card.mediaType.map(_.toString()),
      shortUrl = content.card.shortUrl,
      kickerText = content.header.kicker.flatMap(_.properties.kickerText),
      starRating = content.card.starRating,
      avatarUrl = None,
      branding = content.branding(Edition(request)),
      discussion = DiscussionSettings.fromTrail(content),
      trailText = content.card.trailText,
      galleryCount = content.card.galleryCount,
    )
  }
}

object TrailUtils {
  def normalisePillar(pillar: Option[Pillar]): String =
    pillar match {
      case Some(Pillar("arts")) => "culture"
      case Some(Pillar(p))      => p
      case None                 => "news"
    }
}
