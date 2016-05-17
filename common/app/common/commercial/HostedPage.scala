package common.commercial

import model.{GuardianContentTypes, MetaData, StandalonePage}

case object HostedPage extends StandalonePage {

  override val metadata: MetaData = MetaData.make(
    id = "guardian-hosted",
    webTitle = "Guardian Hosted",
    section = "Hosted",
    contentType = GuardianContentTypes.Hosted,
    analyticsName = "hosted"
  )
}
