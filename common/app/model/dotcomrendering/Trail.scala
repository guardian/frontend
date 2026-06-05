package model.dotcomrendering

import com.github.nscala_time.time.Imports.DateTimeZone
import com.gu.commercial.branding.{Branding, BrandingType, Dimensions, Foundation, PaidContent, Sponsored, Logo => CommercialLogo}
import common.{Edition, LinkTo}
import implicits.FaciaContentFrontendHelpers.FaciaContentFrontendHelper
import layout.DiscussionSettings
import model.{Article, ContentFormat, ImageMedia, Pillar}
import model.pressed.PressedContent
import play.api.libs.json.{JsNull, JsObject, JsResult, JsValue, Json, OFormat}
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

  implicit val brandingTypeFormat: OFormat[BrandingType] = new OFormat[BrandingType] {
    def reads(json: JsValue): JsResult[BrandingType] =
      (json \ "name").validate[String].map {
        case PaidContent.name => PaidContent
        case Foundation.name  => Foundation
        case _                => Sponsored
      }
    def writes(bt: BrandingType): JsObject = Json.obj("name" -> bt.name)
  }

  implicit val dimensionsFormat: OFormat[Dimensions] = Json.format[Dimensions]

  implicit val logoFormat: OFormat[CommercialLogo] = Json.format[CommercialLogo]

  implicit val brandingFormat: OFormat[Branding] = Json.format[Branding]

  implicit val discussionSettingsFormat: OFormat[DiscussionSettings] = Json.format[DiscussionSettings]

  implicit val trailFormat: OFormat[Trail] = {
    val fmt = Json.format[Trail]
    new OFormat[Trail] {
      override def reads(json: JsValue): JsResult[Trail] = fmt.reads(json)
      override def writes(trail: Trail): JsObject =
        JsObject(fmt.writes(trail).fields.filterNot(_._2 == JsNull))
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
