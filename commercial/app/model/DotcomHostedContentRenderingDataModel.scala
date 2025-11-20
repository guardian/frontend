package model

import com.gu.commercial.branding.Dimensions
import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import common.commercial.hosted._
import model.dotcomrendering.DotcomRenderingUtils._
import play.api.libs.json._
import play.api.mvc.RequestHeader

// -----------------------------------------------------------------
// DCR DataModel
// -----------------------------------------------------------------

case class DotcomRenderingHostedContentModel(
    // general / shared
    id: String,
    url: String,
    encodedUrl: String,
    campaign: Option[HostedCampaign],
    title: String,
    mainImageUrl: String,
    thumbnailUrl: String,
    standfirst: String,
    cta: HostedCallToAction,
    metadata: MetaData,
    name: String,
    owner: String,
    logo: HostedLogo,
    fontColour: Colour,

    // article
    body: Option[String],
    mainPicture: Option[String],
    mainPictureCaption: Option[String],
    content: Option[Content],

    // video
    video: Option[HostedVideo],

    // gallery
    images: List[HostedGalleryImage],
)

object DotcomRenderingHostedContentModel {

  // Implicit Json writes
  implicit val colourWrites: Writes[Colour] = Json.writes[Colour]
  implicit val dimensionsWrites: Writes[Dimensions] = Json.writes[Dimensions]
  implicit val logoWrites: Writes[HostedLogo] = Json.writes[HostedLogo]
  implicit val campaignWrites: Writes[HostedCampaign] = Json.writes[HostedCampaign]
  implicit val ctaWrites: Writes[HostedCallToAction] = Json.writes[HostedCallToAction]
  implicit val contentWrites: Writes[Content] = Json.writes[Content]
  implicit val metadataWrites: Writes[MetaData] = Json.writes[MetaData]
  implicit val encodingWrites: Writes[Encoding] = Json.writes[Encoding]
  implicit val videoWrites: Writes[HostedVideo] = Json.writes[HostedVideo]
  implicit val imagesWrites: Writes[HostedGalleryImage] = Json.writes[HostedGalleryImage]
  implicit val dcrContentWrites: Writes[DotcomRenderingHostedContentModel] =
    Json.writes[DotcomRenderingHostedContentModel]

  def toJson(model: DotcomRenderingHostedContentModel): JsValue = {
    val jsValue = Json.toJson(model)
    withoutNull(jsValue)
  }

  def forArticle(
      item: ApiContent,
  )(implicit request: RequestHeader): DotcomRenderingHostedContentModel = {
    val page = HostedArticlePage.fromContent(item).get
    DotcomRenderingHostedContentModel(
      id = page.id,
      url = page.url,
      encodedUrl = page.encodedUrl,
      campaign = page.campaign,
      title = page.title,
      mainImageUrl = page.mainImageUrl,
      thumbnailUrl = page.thumbnailUrl,
      standfirst = page.standfirst,
      cta = page.cta,
      metadata = page.metadata,
      name = page.name,
      owner = page.owner,
      logo = page.logo,
      fontColour = page.fontColour,
      body = Some(page.body),
      mainPicture = Some(page.mainPicture),
      mainPictureCaption = Some(page.mainPictureCaption),
      content = Some(page.content),
      video = None,
      images = List.empty,
    )
  }

  def forVideo(
      item: ApiContent,
  )(implicit request: RequestHeader): DotcomRenderingHostedContentModel = {
    val page = HostedVideoPage.fromContent(item).get
    DotcomRenderingHostedContentModel(
      id = page.id,
      url = page.url,
      encodedUrl = page.encodedUrl,
      campaign = page.campaign,
      title = page.title,
      mainImageUrl = page.mainImageUrl,
      thumbnailUrl = page.thumbnailUrl,
      standfirst = page.standfirst,
      cta = page.cta,
      metadata = page.metadata,
      name = page.name,
      owner = page.owner,
      logo = page.logo,
      fontColour = page.fontColour,
      body = None,
      mainPicture = None,
      mainPictureCaption = None,
      content = None,
      video = Some(page.video),
      images = List.empty,
    )
  }

  def forGallery(
      item: ApiContent,
  )(implicit request: RequestHeader): DotcomRenderingHostedContentModel = {
    val page = HostedGalleryPage.fromContent(item).get
    DotcomRenderingHostedContentModel(
      id = page.id,
      url = page.url,
      encodedUrl = page.encodedUrl,
      campaign = page.campaign,
      title = page.title,
      mainImageUrl = page.mainImageUrl,
      thumbnailUrl = page.thumbnailUrl,
      standfirst = page.standfirst,
      cta = page.cta,
      metadata = page.metadata,
      name = page.name,
      owner = page.owner,
      logo = page.logo,
      fontColour = page.fontColour,
      body = None,
      mainPicture = None,
      mainPictureCaption = None,
      content = None,
      video = None,
      images = page.images,
    )
  }
}
