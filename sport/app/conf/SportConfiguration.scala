package conf

import common.GuardianConfiguration

object SportConfiguration {

  import GuardianConfiguration._

  object pa {
    lazy val footballHost = "https://football-api.guardianapis.com/v1.5"
    lazy val footballKey: String = configuration.getMandatoryStringProperty("pa.api.key")
    lazy val cricketKey: Option[String] = configuration.getStringProperty("pa.cricket.api.key")
    lazy val rugbyKey: Option[String] = configuration.getStringProperty("pa.rugby.api.key")
    lazy val rugbyEndpoint: Option[String] = configuration.getStringProperty("pa.rugby.api.endpoint")
  }

  object optaRugby {
    lazy val endpoint: Option[String] = configuration.getStringProperty("opta.rugby.api.endpoint")
    lazy val apiKey: Option[String] = configuration.getStringProperty("opta.rugby.api.key")
    lazy val apiUser: Option[String] = configuration.getStringProperty("opta.rugby.api.user")
  }

}
