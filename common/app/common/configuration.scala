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

  object scheduling {
    // slows down scheduling e.g. 1 = normal speed, 5 = 5 times slower
    lazy val slowdown = configuration.getIntegerProperty("scheduling.slowdown").getOrElse(1)
  }

  object contentApi {
    lazy val host = configuration.getStringProperty("content.api.host") getOrElse {
      throw new IllegalStateException("Content Api Host not configured")
    }

    lazy val key = configuration.getStringProperty("content.api.key") getOrElse {
      throw new IllegalStateException("Content Api Key not configured")
    }

    lazy val timeout: Int = configuration.getIntegerProperty("content.api.timeout.millis").getOrElse(2000)
  }

  object mongo {
    lazy val connection = configuration.getStringProperty("mongo.connection.readonly.password").getOrElse(throw new RuntimeException("Mongo connection not configured"))
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

  object javascript {
    // This is config that is avaliable to both Javascript and Scala
    // But does not change accross environments
    lazy val config: Map[String, String] = Map(
      "oasUrl" -> "http://oas.guardian.co.uk/RealMedia/ads/",
      "oasSiteId" -> "beta.guardian.co.uk/oas.html",
      "ophanUrl" -> "http://s.ophan.co.uk/js/ophan.min"
    )
    lazy val pageData: Map[String, String] = {
      val keys = configuration.getPropertyNames.filter(_.startsWith("guardian.page."))
      keys.foldLeft(Map.empty[String, String]) {
        case (map, key) => map + (key -> configuration.getStringProperty(key).getOrElse {
          throw new IllegalStateException("no value for key " + key)
        })
      }
    }
  }

  object front {
    lazy val config = configuration.getStringProperty("front.config")
      .getOrElse(throw new RuntimeException("Front config url not set"))
  }

  object pa {
    lazy val apiKey = configuration.getStringProperty("pa.api.key")
      .getOrElse(throw new RuntimeException("unable to load pa api key"))

    lazy val host = configuration.getStringProperty("football.api.host").getOrElse("http://pads6.pa-sport.com")
  }

  object nginx {
    lazy val log: String = configuration.getStringProperty("nginx.log").getOrElse("/var/log/nginx/access.log")
  }
}

object ManifestData {
  lazy val build = ManifestFile.asKeyValuePairs.getOrElse("Build", "DEV").dequote.trim
}
