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

  protected def getMandatoryStringProperty(property: String) = configuration.getStringProperty(property)
    .getOrElse(throw new RuntimeException(s"Property $property not configured"))

  object environment {
    private val installVars = new File("/etc/gu/install_vars") match {
      case f if f.exists => IOUtils.toString(new FileInputStream(f))
      case _ => ""
    }

    private val properties = Properties(installVars)

    def apply(key: String, default: String) = properties.getOrElse(key, default).toLowerCase

    val stage = apply("STAGE", "unknown")
  }

  object switches {
    lazy val configurationUrl = getMandatoryStringProperty("switchboard.config.url")
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
    lazy val host = getMandatoryStringProperty("content.api.host")
    lazy val elasticSearchHost = getMandatoryStringProperty("content.api.elastic.host")
    lazy val key = getMandatoryStringProperty("content.api.key")
    lazy val timeout: Int = configuration.getIntegerProperty("content.api.timeout.millis").getOrElse(2000)
  }

  object ophanApi {
    lazy val key = getMandatoryStringProperty("ophan.api.key")
    lazy val host = getMandatoryStringProperty("ophan.api.host")
    lazy val timeout = configuration.getIntegerProperty("content.api.timeout.millis").getOrElse(2000)
  }

  object frontend {
    lazy val store = getMandatoryStringProperty("frontend.store")
  }

  object mongo {
    lazy val connection = getMandatoryStringProperty("mongo.connection.readonly.password")
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
    lazy val path = getMandatoryStringProperty("static.path")
  }

  object images {
    lazy val path = getMandatoryStringProperty("images.path")
  }

  object assets {
    lazy val path = getMandatoryStringProperty("assets.path")
  }

  object oas {
    lazy val siteIdHost = configuration.getStringProperty("oas.siteId.host").getOrElse(".guardian.co.uk")
  }

  object facebook {
    lazy val appId = getMandatoryStringProperty("guardian.page.fbAppId")
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
        case (map, key) => map + (key -> getMandatoryStringProperty(key))
      }
    }
  }

  object front {
    lazy val config = getMandatoryStringProperty("front.config")
  }

  object facia {
    lazy val stage = configuration.getStringProperty("facia.stage").getOrElse(Configuration.environment.stage)
  }

  object pa {
    lazy val apiKey = getMandatoryStringProperty("pa.api.key")

    lazy val host = configuration.getStringProperty("football.api.host").getOrElse("http://pads6.pa-sport.com")
  }


  object aws {
    lazy val accessKey = getMandatoryStringProperty("aws.access.key")
    lazy val secretKey = getMandatoryStringProperty("aws.access.secret.key")
    lazy val region = getMandatoryStringProperty("aws.region")

    lazy val bucket = getMandatoryStringProperty("aws.bucket")
    lazy val sns: String = getMandatoryStringProperty("sns.notification.topic.arn")

    lazy val credentials: AWSCredentials = new BasicAWSCredentials(accessKey, secretKey)
  }

  object pingdom {
    lazy val url = getMandatoryStringProperty("pingdom.url")
    lazy val user = getMandatoryStringProperty("pingdom.user")
    lazy val password  = getMandatoryStringProperty("pingdom.password")
    lazy val apiKey = getMandatoryStringProperty("pingdom.apikey")
  }

  object riffraff {
    lazy val url = getMandatoryStringProperty("riffraff.url")
    lazy val apiKey = getMandatoryStringProperty("riffraff.apikey")
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
