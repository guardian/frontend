package conf

import com.gu.conf.ConfigurationFactory
import java.io.{FileInputStream, File}
import org.apache.commons.io.IOUtils
import common.{ExecutionContexts, Properties}
import play.api.Play
import play.api.Play.current

object CommercialConfiguration  {
  val configuration = ConfigurationFactory.getConfiguration("frontend", "env")

  def getProperty(name: String): Option[String] = configuration.getStringProperty(name)
}
