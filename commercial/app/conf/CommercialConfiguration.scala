package conf

import com.gu.conf.ConfigurationFactory

object CommercialConfiguration  {

  def getProperty(name: String): Option[String] =
    ConfigurationFactory.getConfiguration("frontend", "env").getStringProperty(name)

  lazy val masterclassesToken = getProperty("masterclasses.token")
}
