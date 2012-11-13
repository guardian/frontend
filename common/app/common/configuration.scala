package common

import com.gu.conf.ConfigurationFactory
import com.gu.management.{ Manifest => ManifestFile }

class BaseGuardianConfiguration(val application: String, val webappConfDirectory: String = "env") {
  protected val configuration = ConfigurationFactory.getConfiguration(application, webappConfDirectory)

  object switches {
    lazy val configurationUrl = configuration.getStringProperty("switchboard.config.url").getOrElse(
      throw new IllegalStateException("Switchboard configuration url not configured")
    )
  }

  object healthcheck {
    lazy val properties = configuration.getPropertyNames filter {
      _ matches """healthcheck\..*\.url"""
    }

    lazy val urls = properties map { property =>
      configuration.getStringProperty(property).get
    }
  }

  object debug {
    lazy val enabled: Boolean = configuration.getStringProperty("debug.enabled").map(_.toBoolean).getOrElse(true)
  }

  override def toString(): String = configuration.toString
}

class GuardianConfiguration(
  override val application: String,
  override val webappConfDirectory: String = "env")
    extends BaseGuardianConfiguration(application, webappConfDirectory) {

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

  object static {
    lazy val path = configuration.getStringProperty("static.path").getOrElse {
      throw new IllegalStateException("Static path not configured")
    }
  }

  object edition {
    lazy val usHost = configuration.getStringProperty("edition.host.us").getOrElse {
      throw new IllegalStateException("US edition not configured")
    }
    lazy val ukHost = configuration.getStringProperty("edition.host.uk").getOrElse {
      throw new IllegalStateException("UK edition not configured")
    }
    private lazy val editionsForHosts = Map(
      ukHost -> "UK",
      usHost -> "US"
    )
    def apply(origin: Option[String]): String = origin flatMap { editionsForHosts.get(_) } getOrElse "UK"
  }

  object javascript {
    lazy val pageData: Map[String, String] = {
      val keys = configuration.getPropertyNames.filter(_.startsWith("guardian.page."))
      keys.foldLeft(Map.empty[String, String]) {
        case (map, key) => map + (key -> configuration.getStringProperty(key).getOrElse {
          throw new IllegalStateException("no value for key " + key)
        })
      }
    }
  }

}

object ManifestData {
  lazy val build = ManifestFile.asKeyValuePairs.getOrElse("Build", "DEV").dequote.trim
}
