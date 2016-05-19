package common.commercial

import model.GuardianContentTypes.Hosted
import model.{MetaData, StandalonePage}
import play.api.libs.json.JsString

case object HostedPage extends StandalonePage {

  override val metadata: MetaData = {
    val toneName = "Hosted content"
    val sectionId = "renault-car-of-the-future"
    val urlSuffix = "design-competition-teaser"
    MetaData.make(
      id = s"commercial/advertiser-content/$sectionId/$urlSuffix",
      webTitle = "Design competition",
      section = sectionId,
      contentType = Hosted,
      analyticsName = s"GFE:$sectionId:$Hosted:$urlSuffix",
      javascriptConfigOverrides = Map(
        "keywords" -> JsString(sectionId),
        "tones" -> JsString(toneName)
      )
    )
  }
}
