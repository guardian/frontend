package conf

import com.gu.conf.ConfigurationFactory
import scala.slick.session.Database

object AdminConfiguration {

  val configuration = ConfigurationFactory.getConfiguration("frontend", "env")

  object mongo {
    lazy val connection = configuration.getStringProperty("mongo.connection.password").getOrElse(throw new RuntimeException("Mongo connection not configured"))
  }

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

  lazy val configKey = configuration.getStringProperty("admin.config.file").getOrElse(throw new RuntimeException("Config file name is not setup"))
  lazy val switchesKey = configuration.getStringProperty("switches.file").getOrElse(throw new RuntimeException("Switches file name is not setup"))
  lazy val topStoriesKey = configuration.getStringProperty("top-stories.config").getOrElse(throw new RuntimeException("Top Stories file name is not setup"))


  object stories {
    val preview = configuration.getStringProperty("stories.preview.url")
  }
}
