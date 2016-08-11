package conf

import common.GuardianConfiguration
import pa.PaClientConfig

object SportConfiguration {

  import GuardianConfiguration._

  object pa {
    lazy val footballHost = PaClientConfig.baseUrl
    lazy val footballKey = configuration.getMandatoryStringProperty("pa.api.key")
    lazy val cricketKey = configuration.getStringProperty("pa.cricket.api.key")
  }

  object optaRugby {
    lazy val endpoint = configuration.getStringProperty("opta.rugby.api.endpoint")
    lazy val apiKey = configuration.getStringProperty("opta.rugby.api.key")
    lazy val apiUser = configuration.getStringProperty("opta.rugby.api.user")
  }

}
