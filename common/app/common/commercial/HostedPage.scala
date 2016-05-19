package common.commercial

import model.{GuardianContentTypes, MetaData, StandalonePage}
import play.api.libs.json.JsString

case object HostedPage extends StandalonePage {

  override val metadata: MetaData = MetaData.make(
    id = "guardian-hosted",
    webTitle = "Guardian Hosted",
    section = "renault-car-of-the-future",
    contentType = GuardianContentTypes.Hosted,
    analyticsName = "GFE:renault-car-of-the-future:hosted:design-competition",
    javascriptConfigOverrides = Map(
      "keywords" -> JsString("renault-car-of-the-future"),
      "tones" -> JsString("advertiser-content")
    )
  )
}
