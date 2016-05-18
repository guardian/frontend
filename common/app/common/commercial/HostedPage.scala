package common.commercial

import model.{GuardianContentTypes, MetaData, StandalonePage}

case object HostedPage extends StandalonePage {

  override val metadata: MetaData = MetaData.make(
    id = "guardian-hosted",
    webTitle = "Guardian Hosted",
    section = "Renault-campaign-test",
    contentType = GuardianContentTypes.Hosted,
    analyticsName = "renault-campaign:hosted:renault-is-epic"
  )
}
