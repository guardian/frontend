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
  lazy val dfpDataKey = configuration.getStringProperty("dfp-data.file").getOrElse(throw new RuntimeException("DFP Data file name is not setup"))

  object analytics {
    lazy val url = configuration.getStringProperty("analytics.db.url").getOrElse(throw new RuntimeException("Analytics database url not configured"))
    lazy val port = configuration.getStringProperty("analytics.db.port").getOrElse(throw new RuntimeException("Analytics database port not configured"))
    lazy val name = configuration.getStringProperty("analytics.db.name").getOrElse(throw new RuntimeException("Analytics database name not configured"))
    lazy val user = configuration.getStringProperty("analytics.db.user").getOrElse(throw new RuntimeException("Analytics database user not configured"))
    lazy val password = configuration.getStringProperty("analytics.db.password").getOrElse(throw new RuntimeException("Analytics database password not configured"))

    lazy val db = Database.forURL(
      "jdbc:postgresql://%s:%s/%s".format(url, port, name),
      user = user,
      password = password,
      driver = "org.postgresql.Driver"
    )
  }

  object fastly {
    lazy val key = configuration.getStringProperty("fastly.key").getOrElse(throw new RuntimeException("Fastly key not configured"))
  }
}
