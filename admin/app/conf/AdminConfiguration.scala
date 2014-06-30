package conf

import com.gu.conf.ConfigurationFactory
import scala.slick.session.Database

object AdminConfiguration {

  val configuration = ConfigurationFactory.getConfiguration("frontend", "env")

  object pa {
    lazy val apiKey = configuration.getStringProperty("pa.api.key")
        .getOrElse(throw new RuntimeException("unable to load pa api key"))

    lazy val host = configuration.getStringProperty("football.api.host").getOrElse("http://pads6.pa-sport.com")
  }

  lazy val configKey = configuration.getStringProperty("admin.config.file").getOrElse(throw new RuntimeException("Config file name is not setup"))
  lazy val switchesKey = configuration.getStringProperty("switches.file").getOrElse(throw new RuntimeException("Switches file name is not setup"))
  lazy val topStoriesKey = configuration.getStringProperty("top-stories.config").getOrElse(throw new RuntimeException("Top Stories file name is not setup"))

  object fastly {
    lazy val key = configuration.getStringProperty("fastly.key").getOrElse(throw new RuntimeException("Fastly key not configured"))
  }

  object dfpApi {
    lazy val clientId = configuration.getStringProperty("api.dfp.clientId")
    lazy val clientSecret = configuration.getStringProperty("api.dfp.clientSecret")
    lazy val refreshToken = configuration.getStringProperty("api.dfp.refreshToken")
    lazy val appName = configuration.getStringProperty("api.dfp.applicationName")
    lazy val networkId = configuration.getStringProperty("api.dfp.networkCode")
  }
}
