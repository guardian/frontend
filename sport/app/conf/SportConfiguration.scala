package conf

import common.GuardianConfiguration
import pa.PaClientConfig

object SportConfiguration {

  import GuardianConfiguration._

  object pa {
    lazy val footballHost = "http://football-api.gu-web.net/v1.5"
    lazy val footballKey = guardianConfiguration.getMandatoryStringProperty("pa.api.key")
    lazy val cricketKey = guardianConfiguration.getStringProperty("pa.cricket.api.key")
  }

  object optaRugby {
    lazy val endpoint = guardianConfiguration.getStringProperty("opta.rugby.api.endpoint")
    lazy val apiKey = guardianConfiguration.getStringProperty("opta.rugby.api.key")
    lazy val apiUser = guardianConfiguration.getStringProperty("opta.rugby.api.user")
  }

}
