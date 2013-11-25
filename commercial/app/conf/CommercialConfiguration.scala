package conf

import com.gu.conf.ConfigurationFactory

object CommercialConfiguration {
  val configuration = ConfigurationFactory.getConfiguration("frontend", "env")

  def getProperty(name: String): Option[String] = configuration.getStringProperty(name)
}
