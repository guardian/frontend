package conf

import com.gu.conf.ConfigurationFactory

object CommercialConfiguration {
  val configuration = ConfigurationFactory.getConfiguration("frontend", "env")

  object masterclasses {
    lazy val apiKey = configuration.getStringProperty("masterclasses.api.key")
      .getOrElse(throw new RuntimeException("unable to load Masterclasses api key"))

    lazy val apiId= configuration.getStringProperty("masterclasses.api.id")
      .getOrElse(throw new RuntimeException("unable to load Masterclasses api id"))
  }
}
