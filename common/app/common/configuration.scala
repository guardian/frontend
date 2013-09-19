package common

import com.gu.conf.ConfigurationFactory
import com.gu.management.{ Manifest => ManifestFile }
import com.amazonaws.auth.{ BasicAWSCredentials, AWSCredentials }
import java.net.InetAddress
import play.api.Play
import java.io.{FileInputStream, File}
import org.apache.commons.io.IOUtils
import conf.Configuration

class BaseGuardianConfiguration(val application: String, val webappConfDirectory: String = "env") extends Logging {
  protected val configuration = ConfigurationFactory.getConfiguration(application, webappConfDirectory)

  object environment {
    private val installVars = (new File("/etc/gu/install_vars")) match {
      case f if f.exists => IOUtils.toString(new FileInputStream(f))
      case _ => ""
    }

    private val properties = Properties(installVars)

    def apply(key: String, default: String) = properties.getOrElse(key, default).toLowerCase

    val stage = apply("STAGE", "unknown")
  }

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

    lazy val timeout: Int = configuration.getIntegerProperty("content.api.timeout.millis").getOrElse(2000)
  }

  object ophanApi {
    lazy val key = configuration.getStringProperty("ophan.api.key") getOrElse {
      throw new IllegalStateException("Ophan Api key not configured")
    }
    lazy val host = configuration.getStringProperty("ophan.api.host") getOrElse {
      throw new IllegalStateException("Ophan Api host not configured")
    }

    lazy val timeout = configuration.getIntegerProperty("content.api.timeout.millis").getOrElse(2000)
  }

  object frontend {
    lazy val store = configuration.getStringProperty("frontend.store") getOrElse {
      throw new IllegalStateException("Fronts Api not configured")
    }
  }

  object mongo {
    lazy val connection = configuration.getStringProperty("mongo.connection.readonly.password").getOrElse(throw new RuntimeException("Mongo connection not configured"))
  }

  object hostMachine {
    lazy val name = InetAddress.getLocalHost.getHostName
  }

  object site {
    lazy val host = configuration.getStringProperty("guardian.page.host").getOrElse("")
  }

  object proxy {
    lazy val isDefined: Boolean = hostOption.isDefined && portOption.isDefined

    private lazy val hostOption = Option(System.getenv("proxy_host"))
    private lazy val portOption = Option(System.getenv("proxy_port")) flatMap { _.toIntOption }

    lazy val host: String = hostOption getOrElse {
      throw new IllegalStateException("HTTP proxy host not configured")
    }

    lazy val port: Int = portOption getOrElse {
      throw new IllegalStateException("HTTP proxy port not configured")
    }
  }

  object github {
    lazy val token = configuration.getStringProperty("github.token")
  }

  object ajax {
    lazy val url = configuration.getStringProperty("ajax.url").getOrElse("")
    lazy val corsOrigin = configuration.getStringProperty("ajax.cors.origin")
  }

  object id {
    lazy val url = configuration.getStringProperty("id.url").getOrElse("")
    lazy val apiRoot = configuration.getStringProperty("id.apiRoot").getOrElse("")
    lazy val domain = """^https?://(?:profile\.)?([^/:]+)""".r.unapplySeq(url).flatMap(_.headOption).getOrElse("theguardian.com")
    lazy val apiClientToken = configuration.getStringProperty("id.apiClientToken").getOrElse("")
    lazy val apiJsClientToken = configuration.getStringProperty("id.apiJsClientToken").getOrElse("")
    lazy val webappUrl = configuration.getStringProperty("id.webapp.url").getOrElse("")
  }

  object static {
    lazy val path = configuration.getStringProperty("static.path").getOrElse {
      throw new IllegalStateException("Static path not configured")
    }
  }

  object images {
    lazy val path = configuration.getStringProperty("images.path").getOrElse {
      throw new IllegalStateException("Image path not configured")
    }
  }

  object assets {
    lazy val path = configuration.getStringProperty("assets.path").getOrElse {
      throw new IllegalStateException("Image path not configured")
    }
  }

  object oas {
    lazy val siteIdHost = configuration.getStringProperty("oas.siteId.host").getOrElse(".guardian.co.uk")
  }

  object facebook {
    lazy val appId = configuration.getStringProperty("guardian.page.fbAppId").getOrElse {
      throw new IllegalStateException("Facebook app ID not configured")
    }
    lazy val imageFallback = "http://static-secure.guim.co.uk/icons/social/og/gu-logo-fallback.png"
  }

  object ios {
    lazy val ukAppId = "409128287"
    lazy val usAppId = "411493119"
  }

  object javascript {
    // This is config that is avaliable to both Javascript and Scala
    // But does not change across environments
    lazy val config: Map[String, String] = Map(
      "ophanUrl" -> "http://s.ophan.co.uk/js/ophan.min",
      "googleSearchUrl" -> "http://www.google.co.uk/cse/cse.js",
      "discussionApiUrl" -> "http://discussion.guardianapis.com/discussion-api",
      "interactiveUrl" -> "http://interactive.guim.co.uk/next-gen/"
    )
    lazy val pageData: Map[String, String] = {
      val keys = configuration.getPropertyNames.filter(_.startsWith("guardian.page."))
      keys.foldLeft(Map.empty[String, String]) {
        case (map, key) => map + (key -> configuration.getStringProperty(key).getOrElse {
          throw new IllegalStateException(s"no value for key $key")
        })
      }
    }
  }

  object front {
    lazy val config = configuration.getStringProperty("front.config")
      .getOrElse(throw new RuntimeException("Front config url not set"))
  }

  object facia {
    lazy val stage = configuration.getStringProperty("facia.stage").getOrElse(Configuration.environment.stage)
  }

  object pa {
    lazy val apiKey = configuration.getStringProperty("pa.api.key")
      .getOrElse(throw new RuntimeException("unable to load pa api key"))

    lazy val host = configuration.getStringProperty("football.api.host").getOrElse("http://pads6.pa-sport.com")
  }


  object aws {
    lazy val accessKey = configuration.getStringProperty("aws.access.key").getOrElse(throw new RuntimeException("AWS access key not set"))
    lazy val secretKey = configuration.getStringProperty("aws.access.secret.key").getOrElse(throw new RuntimeException("AWS secret key not set"))
    lazy val region = configuration.getStringProperty("aws.region").getOrElse(throw new RuntimeException("AWS region is not setup"))

    lazy val bucket = configuration.getStringProperty("aws.bucket").getOrElse(throw new RuntimeException("AWS bucket is not setup"))
    lazy val sns: String = configuration.getStringProperty("sns.notification.topic.arn").getOrElse {
      throw new IllegalStateException("Cannot send SNS notifications without topic ARN property (sns.notification.topic.arn).")
    }

    lazy val credentials: AWSCredentials = new BasicAWSCredentials(accessKey, secretKey)
  }

  object pingdom {
    lazy val url = configuration.getStringProperty("pingdom.url").getOrElse(throw new RuntimeException("Pingdom url not set"))
    lazy val user = configuration.getStringProperty("pingdom.user").getOrElse(throw new RuntimeException("Pingdom user not set"))
    lazy val password  = configuration.getStringProperty("pingdom.password").getOrElse(throw new RuntimeException("Pingdom password not set"))
    lazy val apiKey = configuration.getStringProperty("pingdom.apikey").getOrElse(throw new RuntimeException("Pingdom api key not set"))
  }

  object riffraff {
    lazy val url = configuration.getStringProperty("riffraff.url").getOrElse(throw new RuntimeException("RiffRaff url not set"))
    lazy val apiKey = configuration.getStringProperty("riffraff.apikey").getOrElse(throw new RuntimeException("RiffRaff api key not set"))
  }

  // log out Play config on start
  log.info("Play config ----------------------------------------------------------------------------")
  Play.maybeApplication.map(c => c.configuration.entrySet.toSeq.sortBy(_._1).foreach{ case (k,v) =>
    log.info(s"$k=$v")
  })
  log.info("Play config ----------------------------------------------------------------------------")
}

object ManifestData {
  lazy val build = ManifestFile.asKeyValuePairs.getOrElse("Build", "DEV").dequote.trim
}
