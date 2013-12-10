package conf

import com.gu.conf.ConfigurationFactory

object AdminConfiguration {

  val configuration = ConfigurationFactory.getConfiguration("frontend", "env")

  object mongo {
    lazy val connection = configuration.getStringProperty("mongo.connection.password").getOrElse(throw new RuntimeException("Mongo connection not configured"))
  }

  object pa {
    lazy val apiKey = configuration.getStringProperty("pa.api.key")
        .getOrElse(throw new RuntimeException("unable to load pa api key"))

    lazy val host = configuration.getStringProperty("football.api.host").getOrElse("http://pads6.pa-sport.com")
  }

  lazy val configKey = configuration.getStringProperty("admin.config.file").getOrElse(throw new RuntimeException("Config file name is not setup"))
  lazy val switchesKey = configuration.getStringProperty("switches.file").getOrElse(throw new RuntimeException("Switches file name is not setup"))
  lazy val topStoriesKey = configuration.getStringProperty("top-stories.config").getOrElse(throw new RuntimeException("Top Stories file name is not setup"))
}
