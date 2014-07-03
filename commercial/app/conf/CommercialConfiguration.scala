package conf

import com.gu.conf.ConfigurationFactory
import java.io.{FileInputStream, File}
import org.apache.commons.io.IOUtils
import common.{ExecutionContexts, Properties}
import play.api.Play
import play.api.Play.current

object CommercialConfiguration extends ExecutionContexts {
  val configuration = ConfigurationFactory.getConfiguration("frontend", "env")

  object environment {
    private val installVars = new File("/etc/gu/install_vars") match {
      case f if f.exists => IOUtils.toString(new FileInputStream(f))
      case _ => ""
    }

    private val properties = Properties(installVars)

    def apply(key: String, default: String) = properties.getOrElse(key, default).toLowerCase

    val stage = apply("STAGE", "unknown")

    val projectName = Play.application.configuration.getString("guardian.projectName").getOrElse("frontend")
    val secure = Play.application.configuration.getBoolean("guardian.secure").getOrElse(false)

    lazy val isNonProd = List("dev", "code", "gudev").contains(stage)
  }


  def getProperty(name: String): Option[String] = configuration.getStringProperty(name)


  lazy val travelOffersS3Key = s"${environment.stage.toUpperCase}/commercial/cache/traveloffers.xml"

}
