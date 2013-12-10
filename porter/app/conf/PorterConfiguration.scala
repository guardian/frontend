package conf

import com.gu.conf.ConfigurationFactory
import scala.slick.session.Database

object PorterConfiguration {

  val configuration = ConfigurationFactory.getConfiguration("frontend", "env")

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
