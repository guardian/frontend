package common.commercial

import model.GuardianContentTypes.Hosted
import model.{MetaData, SectionSummary, StandalonePage}
import play.api.libs.json.{JsArray, JsNumber, JsString}

trait HostedPage extends StandalonePage  {
  def pageUrl: String
  def pageName: String
  def pageTitle: String
  def standfirst: String
  def logoUrl: String
}

case class HostedVideoPage(
                       pageUrl: String,
                       pageName: String,
                       standfirst: String,
                       logoUrl: String,
                       zoeUrl: String,
                       bannerUrl: String,
                       video: HostedVideo,
                       nextPageName: String
                     ) extends HostedPage {

  val pageTitle: String  = s"Advertiser content hosted by the Guardian: ${video.title} - video"

  override val metadata: MetaData = {
    val toneId = "tone/hosted-content"
    val toneName = "Hosted content"
    val sectionId = "renault-car-of-the-future"
    val keywordId = s"$sectionId/$sectionId"
    val keywordName = sectionId
    MetaData.make(
      id = s"commercial/advertiser-content/$sectionId/$pageName",
      webTitle = pageTitle,
      section = Some(SectionSummary.fromId(sectionId)),
      contentType = Hosted,
      analyticsName = s"GFE:$sectionId:$Hosted:$pageName",
      description = Some(standfirst),
      javascriptConfigOverrides = Map(
        "keywordIds" -> JsString(keywordId),
        "keywords" -> JsString(keywordName),
        "toneIds" -> JsString(toneId),
        "tones" -> JsString(toneName)
      ),
      opengraphPropertiesOverrides = Map(
        "og:url" -> pageUrl,
        "og:title" -> pageTitle,
        "og:description" ->
          s"ADVERTISER CONTENT FROM RENAULT HOSTED BY THE GUARDIAN | $standfirst",
        "og:image" -> video.posterUrl,
        "fb:app_id" -> "180444840287"
      )
    )
  }

  lazy val nextPage : HostedVideoPage = RenaultHostedPages.fromPageName(nextPageName).collect{case v: HostedVideoPage => v} getOrElse RenaultHostedPages.defaultPage
}

case class HostedGalleryPage(
                       pageUrl: String,
                       pageName: String,
                       title: String,
                       standfirst: String,
                       ctaText: String,
                       ctaLink: String,
                       ctaIndex: Integer,
                       images: List[HostedGalleryImage],
                       logoUrl: String
                     ) extends HostedPage {

  val pageTitle: String  = s"Advertiser content hosted by the Guardian: $title - gallery"

  override val metadata: MetaData = {
    val toneId = "tone/hosted-content"
    val toneName = "Hosted content"
    val sectionId = "hosted-gallery"
    val keywordId = s"$sectionId/$sectionId"
    val keywordName = sectionId
    MetaData.make(
      id = s"commercial/advertiser-content/$sectionId/$pageName",
      webTitle = pageTitle,
      section = Some(SectionSummary.fromId(sectionId)),
      contentType = Hosted,
      analyticsName = s"GFE:$sectionId:$Hosted:$pageName",
      description = Some(pageTitle),
      javascriptConfigOverrides = Map(
        "keywordIds" -> JsString(keywordId),
        "keywords" -> JsString(keywordName),
        "toneIds" -> JsString(toneId),
        "tones" -> JsString(toneName),
        "images" -> JsArray(images.map((image) => JsString(image.url))),
        "ctaIndex" -> JsNumber(BigDecimal(ctaIndex))
      ),
      opengraphPropertiesOverrides = Map(
        "og:url" -> pageUrl,
        "og:title" -> pageTitle,
        "og:description" ->
          s"ADVERTISER CONTENT FROM OMGB HOSTED BY THE GUARDIAN | $title",
        "og:image" -> logoUrl,
        "fb:app_id" -> "180444840287"
      )
    )
  }
}

case class HostedVideo(
                        mediaId: String,
                        title: String,
                        duration: Int,
                        posterUrl: String,
                        srcUrl: String
                      )

case class HostedGalleryImage(
                        url: String,
                        title: String,
                        caption: String
                      )

object HostedPage {

  private val renaultCampaignName = "renault-car-of-the-future"
  private val galleryTestCampaignName = "hosted-gallery"
  private val visitBritainCampaignName = "visit-britain"

  def fromPageName(campaignName: String, pageName: String): Option[HostedPage] = {
    campaignName match {
      case `renaultCampaignName` => RenaultHostedPages.fromPageName(pageName)
      case `galleryTestCampaignName` => HostedGalleryTestPage.fromPageName(pageName)
      case `visitBritainCampaignName` => VisitBritainHostedPages.fromPageName(pageName)
      case _ => None;
    }
  }
}
