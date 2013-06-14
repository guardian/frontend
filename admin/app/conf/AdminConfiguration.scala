package conf

import common.Properties
import com.gu.conf.ConfigurationFactory
import com.gu.management._
import java.io.{FileInputStream, File}
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
