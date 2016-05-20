package common.commercial

import model.GuardianContentTypes.Hosted
import model.{MetaData, StandalonePage}
import play.api.libs.json.JsString

case object HostedPage extends StandalonePage {

  override val metadata: MetaData = {
    val title = "Advertiser content hosted by the Guardian: Designing the car of the future - video"
    val description =
      "Who better to dream up the transport of tomorrow than the people who'll be buying them? Follow a group of students as they work on designing the interior of self-driving cars"
    val toneId = "tone/hosted-content"
    val toneName = "Hosted content"
    val sectionId = "renault-car-of-the-future"
    val keywordId = s"$sectionId/$sectionId"
    val keywordName = sectionId
    val urlSuffix = "design-competition-teaser"
    MetaData.make(
      id = s"commercial/advertiser-content/$sectionId/$urlSuffix",
      webTitle = title,
      section = sectionId,
      contentType = Hosted,
      analyticsName = s"GFE:$sectionId:$Hosted:$urlSuffix",
      description = Some(description),
      javascriptConfigOverrides = Map(
        "keywordIds" -> JsString(keywordId),
        "keywords" -> JsString(keywordName),
        "toneIds" -> JsString(toneId),
        "tones" -> JsString(toneName)
      ),
      opengraphPropertiesOverrides = Map(
        "og:url" ->
          "http://theguardian.com/commercial/advertiser-content/renault-car-of-the-future/design-competition-teaser",
        "og:title" -> title,
        "og:description" -> description,
        "og:image" ->
          "https://aws-frontend-static.s3.amazonaws.com/PROD/frontend-static/images/commercial/038c373fd249e5a2f4b6ae02e7cf3a93/renault-video-poster.jpg",
        "fb:app_id" -> "180444840287"
      )
    )
  }
}
