package common.commercial

import model.GuardianContentTypes.Hosted
import model.{MetaData, StandalonePage}
import play.api.libs.json.JsString

case class HostedPage(
                     pageUrl:String,
                       pageName: String,
                       pageTitle: String,
                       videoTitle: String,
                       standfirst: String
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
      section = sectionId,
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
        "og:image" ->
          "https://aws-frontend-static.s3.amazonaws.com/PROD/frontend-static/images/commercial/038c373fd249e5a2f4b6ae02e7cf3a93/renault-video-poster.jpg",
        "fb:app_id" -> "180444840287"
      )
    )
  }
}
