package common.commercial.hosted

import model.GuardianContentTypes._
import model.{MetaData, SectionSummary}
import play.api.libs.json.{JsArray, JsNumber, JsString}

case class HostedGalleryPage(
  campaign: HostedCampaign,
  pageUrl: String,
  pageName: String,
  title: String,
  standfirst: String,
  ctaText: String,
  ctaLink: String,
  ctaIndex: Integer,
  images: List[HostedGalleryImage]
) extends HostedPage {

  val pageTitle: String = s"Advertiser content hosted by the Guardian: $title - gallery"

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
        "og:image" -> images.head.url,
        "fb:app_id" -> "180444840287"
      )
    )
  }
}

case class HostedGalleryImage(
  url: String,
  title: String,
  caption: String
)
