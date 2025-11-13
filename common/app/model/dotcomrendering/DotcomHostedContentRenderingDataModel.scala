package model.dotcomrendering

import ab.ABTests
import common.commercial.hosted.{
  Colour,
  HostedArticlePage,
  HostedCallToAction,
  HostedCampaign,
  HostedGalleryImage,
  HostedGalleryPage,
  HostedLogo,
  HostedPage,
  HostedVideo,
  HostedVideoPage,
}
import com.gu.contentapi.client.model.v1.Content
import common.Edition
import conf.Configuration
import experiments.ActiveExperiments
import model.dotcomrendering.DotcomRenderingUtils._
import model.{Content, MetaData}
import play.api.libs.json._
import play.api.mvc.RequestHeader
import views.support.{CamelCase, JavaScriptPage}

// -----------------------------------------------------------------
// DCR DataModel
// -----------------------------------------------------------------

case class DotcomHostedContentRenderingDataModel(
    // generic hosted content
    id: String,
    url: String,
    encodedUrl: String,
    campaign: Option[HostedCampaign],
    title: String,
    mainImageUrl: String,
    thumbnailUrl: String,
    standfirst: String,
    cta: HostedCallToAction,
    name: String,
    owner: String,
    logo: HostedLogo,
    fontColour: Colour,

    // article
    body: Option[String],
    mainPicture: Option[String],
    mainPictureCaption: Option[String],
    content: Option[Content],
    metadata: MetaData,

    // video
    video: Option[HostedVideo],

    // gallery
    ctaIndex: Option[Integer],
    images: List[HostedGalleryImage],
)

object DotcomHostedContentRenderingDataModel {

  implicit val writes: Writes[DotcomHostedContentRenderingDataModel] =
    new Writes[DotcomHostedContentRenderingDataModel] {
      def writes(model: DotcomHostedContentRenderingDataModel) = {
        val obj = Json.obj(
          "id" -> model.id,
          "url" -> model.url,
          "encodedUrl" -> model.encodedUrl,
          "campaign" -> model.campaign,
          "title" -> model.title,
          "mainImageUrl" -> model.mainImageUrl,
          "thumbnailUrl" -> model.thumbnailUrl,
          "standfirst" -> model.standfirst,
          "cta" -> model.cta,
          "name" -> model.name,
          "owner" -> model.owner,
          "logo" -> model.logo,
          "fontColour" -> model.fontColour,
          "body" -> model.body,
          "mainPicture" -> model.mainPicture,
          "mainPictureCaption" -> model.mainPictureCaption,
          "content" -> model.content,
          "metadata" -> model.metadata,
          "video" -> model.video,
          "ctaIndex" -> model.ctaIndex,
          "images" -> model.images,
        )

        ElementsEnhancer.enhanceDcrObject(obj)
      }
    }

  def toJson(model: DotcomHostedContentRenderingDataModel): JsValue = {
    val jsValue = Json.toJson(model)
    withoutNull(jsValue)
  }

  def forArticle(
      item: Content,
      request: RequestHeader,
      pageType: PageType,
  ): DotcomRenderingDataModel = {
    val articlePage = HostedArticlePage.fromContent(item)
    apply()
  }

  def forVideo(
      item: Content,
      request: RequestHeader,
      pageType: PageType,
  ): DotcomRenderingDataModel = {
    val videoPage = HostedVideoPage.fromContent(item)
    apply()
  }

  def forGallery(
      item: Content,
      request: RequestHeader,
      pageType: PageType,
  ) = {
    val galleryPage = HostedGalleryPage.fromContent(item)
    apply()
  }

  def apply(
      item: Content,
      request: RequestHeader,
      pageType: PageType,
      body: String,
      mainPicture: String,
      mainPictureCaption: String,
      content: Content,
      metadata: MetaData,
      video: HostedVideo,
      images: List[HostedGalleryImage],
  ): DotcomHostedContentRenderingDataModel = {
    val page = HostedPage.fromContent(item)
//    val edition = Edition.edition(request)
//    val contentDateTimes: ArticleDateTimes = ArticleDateTimes(
//      webPublicationDate = item.trail.webPublicationDate,
//      firstPublicationDate = item.fields.firstPublicationDate,
//      hasBeenModified = item.content.hasBeenModified,
//      lastModificationDate = item.fields.lastModified,
//    )
//
//    val switches: Map[String, Boolean] = conf.switches.Switches.all
//      .filter(_.exposeClientSide)
//      .foldLeft(Map.empty[String, Boolean])((acc, switch) => {
//        acc + (CamelCase.fromHyphenated(switch.name) -> switch.isSwitchedOn)
//      })
//
//    val config = Config(
//      switches = switches,
//      abTests = ActiveExperiments.getJsMap(request),
//      serverSideABTests = ABTests.allTests(request),
//      ampIframeUrl = assetURL("data/vendor/amp-iframe.html"),
//      googletagUrl = Configuration.googletag.jsLocation,
//      stage = common.Environment.stage,
//      frontendAssetsFullURL = Configuration.assets.fullURL(common.Environment.stage),
//    )
//    val combinedConfig: JsObject = {
//      val jsPageConfig: Map[String, JsValue] =
//        JavaScriptPage.getMap(page, Edition(request), pageType.isPreview, request)
//      Json.toJsObject(config).deepMerge(JsObject(jsPageConfig))
//    }

    page.map(hc =>
      DotcomHostedContentRenderingDataModel(
        id = hc.id,
        url = hc.url,
        encodedUrl = hc.encodedUrl,
        campaign = hc.campaign,
        title = hc.title,
        mainImageUrl = hc.mainImageUrl,
        thumbnailUrl = hc.thumbnailUrl,
        standfirst = hc.standfirst,
        cta = hc.cta,
        name = hc.name,
        owner = hc.owner,
        logo = hc.logo,
        fontColour = hc.fontColour,
        body = body,
        mainPicture = mainPicture,
        mainPictureCaption = mainPictureCaption,
        content = content,
        metadata = metadata,
        video = video,
        images = images,
      ),
    )

  }
}
