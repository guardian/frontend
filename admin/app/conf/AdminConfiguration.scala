package conf

import com.gu.conf.ConfigurationFactory

object AdminConfiguration {

  val configuration = ConfigurationFactory.getConfiguration("frontend", "env")

  object mongo {
    lazy val connection = configuration.getStringProperty("mongo.connection.password").getOrElse(throw new RuntimeException("Mongo connection not configured"))
  }

  lazy val configKey = configuration.getStringProperty("admin.config.file").getOrElse(throw new RuntimeException("Config file name is not setup"))
  lazy val switchesKey = configuration.getStringProperty("switches.file").getOrElse(throw new RuntimeException("Switches file name is not setup"))
  lazy val frontsKey = configuration.getStringProperty("frontsApi.file").getOrElse(throw new RuntimeException("Fronts API file is not setup"))


  object stories {
    val preview = configuration.getStringProperty("stories.preview.url")
  }
}
