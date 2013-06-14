package conf

import common.Properties
import com.gu.conf.ConfigurationFactory
import com.gu.management._
import java.io.{FileInputStream, File}
import logback.LogbackLevelPage
import play.{Management => GuManagement}
import org.apache.commons.io.IOUtils

object AdminConfiguration {

  val configuration = ConfigurationFactory.getConfiguration("frontend", "env")

  object environment {
    private val installVars = (new File("/etc/gu/install_vars")) match {
      case f if f.exists => IOUtils.toString(new FileInputStream(f))
      case _ => ""
    }

    private val properties = Properties(installVars)

    def apply(key: String, default: String) = properties.getOrElse(key, default).toLowerCase

    val stage = apply("STAGE", "unknown")
  }

  object aws {
    lazy val accessKey = configuration.getStringProperty("aws.access.key").getOrElse(throw new RuntimeException("AWS access key not set"))
    lazy val secretKey = configuration.getStringProperty("aws.access.secret.key").getOrElse(throw new RuntimeException("AWS secret key not set"))
    lazy val bucket = configuration.getStringProperty("aws.bucket").getOrElse(throw new RuntimeException("AWS bucket is not setup"))
  }

  object mongo {
    lazy val connection = configuration.getStringProperty("mongo.connection.password").getOrElse(throw new RuntimeException("Mongo connection not configured"))
  }

  lazy val configKey = configuration.getStringProperty("admin.config.file").getOrElse(throw new RuntimeException("Config file name is not setup"))
  lazy val switchesKey = configuration.getStringProperty("switches.file").getOrElse(throw new RuntimeException("Switches file name is not setup"))


  object stories {
    val preview = configuration.getStringProperty("stories.preview.url")
  }

  object healthcheck {
      lazy val properties = configuration.getPropertyNames filter {
        _ matches """healthcheck\..*\.url"""
      }

      lazy val urls = properties map { property =>
        configuration.getStringProperty(property).get
      }
    }
}

object ConfigUpdateCounter extends CountMetric("actions", "config_updates", "Config updates", "number of times config was updated")
object ConfigUpdateErrorCounter extends CountMetric("actions", "config_update_errors", "Config update errors", "number of times config update failed")

object SwitchesUpdateCounter extends CountMetric("actions", "switches_updates", "Switches updates", "number of times switches was updated")
object SwitchesUpdateErrorCounter extends CountMetric("actions", "switches_update_errors", "Switches update errors", "number of times switches update failed")


object Management extends GuManagement {

  val applicationName = "frontend-admin"

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(
      "/login"
    ),
    StatusPage(applicationName,
      Seq(ConfigUpdateCounter, ConfigUpdateErrorCounter, SwitchesUpdateCounter, SwitchesUpdateErrorCounter)
    ),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
