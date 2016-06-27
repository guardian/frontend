package conf

import com.gu.conf.ConfigurationFactory
import common.BadConfigurationException
import pa.PaClientConfig

object SportConfiguration {

  val configuration = ConfigurationFactory.getConfiguration("frontend", "env")

  private implicit class OptionalString2MandatoryString(conf: com.gu.conf.Configuration) {
    def getMandatoryStringProperty(property: String) = configuration.getStringProperty(property)
      .getOrElse(throw new BadConfigurationException(s"$property not configured"))
  }

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
