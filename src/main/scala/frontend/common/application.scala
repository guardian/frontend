package frontend.common

import play.api.Logger
import com.gu.conf.ConfigurationFactory

trait Logging {
  implicit val log = Logger(getClass)
}

class Configuration(application: String, webappConfDirectory: String = "env") {
  private val configuration = ConfigurationFactory.getConfiguration(application, webappConfDirectory)

  object plugins {
    lazy val location = configuration.getStringProperty("plugins.location").getOrElse {
      throw new IllegalStateException("Plugins Location not configured")
    }
  }

  object contentApi {
    lazy val host = configuration.getStringProperty("content.api.host") getOrElse {
      throw new IllegalStateException("Content Api Host not configured")
    }

    lazy val key = configuration.getStringProperty("content.api.key") getOrElse {
      throw new IllegalStateException("Content Api Key not configured")
    }
  }

  object proxy {
    lazy val isDefined: Boolean = hostOption.isDefined && portOption.isDefined

    private lazy val hostOption = Option(System.getProperty("http.proxyHost"))
    private lazy val portOption = Option(System.getProperty("http.proxyPort")) flatMap { _.toIntOption }

    lazy val host: String = hostOption getOrElse {
      throw new IllegalStateException("HTTP proxy host not configured")
    }

    lazy val port: Int = portOption getOrElse {
      throw new IllegalStateException("HTTP proxy port not configured")
    }
  }

  override def toString(): String = configuration.toString
}