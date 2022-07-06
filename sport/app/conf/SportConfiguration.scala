package conf

import common.GuardianConfiguration

object SportConfiguration {

  import GuardianConfiguration._

  object pa {
    lazy val footballHost = "https://football-api.guardianapis.com/v1.5"
    lazy val footballKey = configuration.getMandatoryStringProperty("pa.api.key")
    lazy val cricketKey = configuration.getStringProperty("pa.cricket.api.key")
    lazy val rugbyKey = configuration.getStringProperty("pa.rugby.api.key")
    lazy val rugbyEndpoint = configuration.getStringProperty("pa.rugby.api.endpoint")
  }

  object optaRugby {
    lazy val endpoint = configuration.getStringProperty("opta.rugby.api.endpoint")
    lazy val apiKey = configuration.getStringProperty("opta.rugby.api.key")
    lazy val apiUser = configuration.getStringProperty("opta.rugby.api.user")
  }

}
