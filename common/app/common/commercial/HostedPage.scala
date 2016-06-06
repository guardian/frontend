package common.commercial

import model.GuardianContentTypes.Hosted
import model.{MetaData, SectionSummary, StandalonePage}
import play.api.libs.json.JsString

case class HostedPage(
                       pageUrl: String,
                       pageName: String,
                       pageTitle: String,
                       standfirst: String,
                       logoUrl: String,
                       bannerUrl: String,
                       video: HostedVideo,
                       nextVideo: HostedNextVideo
                     ) extends StandalonePage {

  override val metadata: MetaData = {
    val toneId = "tone/hosted-content"
    val toneName = "Hosted content"
    val sectionId = "renault-car-of-the-future"
    val keywordId = s"$sectionId/$sectionId"
    val keywordName = sectionId
    MetaData.make(
      id = s"commercial/advertiser-content/$sectionId/$pageName",
      webTitle = pageTitle,
      sectionSummary = Some(SectionSummary.fromId(sectionId)),
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
}

case class HostedVideo(
                        mediaId: String,
                        title: String,
                        duration: Int,
                        posterUrl: String,
                        srcUrl: String
                      )


case class HostedNextVideo(
                        title: String,
                        imageUrl: String,
                        link: String
                      )
