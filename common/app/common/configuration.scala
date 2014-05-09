package common

import com.gu.conf.ConfigurationFactory
import com.gu.management.{ Manifest => ManifestFile }
import com.amazonaws.auth._
import play.api.Play
import play.api.Play.current
import java.io.{FileInputStream, File}
import org.apache.commons.io.IOUtils
import conf.Configuration
import com.amazonaws.internal.StaticCredentialsProvider

class BadConfigurationException(property: String) extends RuntimeException(s"Property $property not configured")

class GuardianConfiguration(val application: String, val webappConfDirectory: String = "env") extends Logging {

  protected val configuration = ConfigurationFactory.getConfiguration(application, webappConfDirectory)

  private implicit class OptionalString2MandatoryString(conf: com.gu.conf.Configuration) {
    def getMandatoryStringProperty(property: String) = configuration.getStringProperty(property)
      .getOrElse(throw new BadConfigurationException(property))
  }

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

  object switches {
    lazy val configurationUrl = configuration.getMandatoryStringProperty("switchboard.config.url")
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
    lazy val beaconUrl: String = configuration.getStringProperty("beacon.url").getOrElse("")
  }

  override def toString = configuration.toString

  case class Auth(user: String, password: String)

  object contentApi {
    lazy val elasticSearchHost = configuration.getMandatoryStringProperty("content.api.elastic.host")
    lazy val key = configuration.getMandatoryStringProperty("content.api.key")
    lazy val timeout: Int = configuration.getIntegerProperty("content.api.timeout.millis").getOrElse(2000)

    lazy val previewAuth: Option[Auth] = for {
      user <- configuration.getStringProperty("content.api.preview.user")
      password <- configuration.getStringProperty("content.api.preview.password")
    } yield Auth(user, password)

    object write {
      lazy val username: Option[String] = configuration.getStringProperty("contentapi.write.username")
      lazy val password: Option[String] = configuration.getStringProperty("contentapi.write.password")
      lazy val endpoint: Option[String] = configuration.getStringProperty("contentapi.write.endpoint")
    }
  }

  object ophanApi {
    lazy val key = configuration.getStringProperty("ophan.api.key")
    lazy val host = configuration.getStringProperty("ophan.api.host")
    lazy val timeout = configuration.getIntegerProperty("content.api.timeout.millis").getOrElse(2000)
  }

  object ophan {
    lazy val jsLocation = configuration.getStringProperty("ophan.js.location").getOrElse("http://j.ophan.co.uk/ophan.ng")
  }

  object googletag {
    lazy val jsLocation = configuration.getStringProperty("googletag.js.location").getOrElse("//www.googletagservices.com/tag/js/gpt.js")
  }

  object frontend {
    lazy val store = configuration.getMandatoryStringProperty("frontend.store")
  }

  object mongo {
    lazy val connection = configuration.getMandatoryStringProperty("mongo.connection.readonly.password")
  }

  object site {
    lazy val host = configuration.getStringProperty("guardian.page.host").getOrElse("")
  }

  object cookies {
    lazy val lastSeenKey: String = "lastseen"
    lazy val sessionExpiryTime = configuration.getIntegerProperty("auth.timeout").getOrElse(60000)
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
    lazy val url =
      if (environment.secure) configuration.getStringProperty("ajax.secureUrl").getOrElse("")
      else configuration.getStringProperty("ajax.url").getOrElse("")
    lazy val corsOrigins: Seq[String] = configuration.getStringProperty("ajax.cors.origin").map(_.split(",")
      .map(_.trim).toSeq).getOrElse(Nil)
  }

  object id {
    lazy val url = configuration.getStringProperty("id.url").getOrElse("")
    lazy val apiRoot = configuration.getStringProperty("id.apiRoot").getOrElse("")
    lazy val domain = """^https?://(?:profile\.)?([^/:]+)""".r.unapplySeq(url).flatMap(_.headOption).getOrElse("theguardian.com")
    lazy val apiClientToken = configuration.getStringProperty("id.apiClientToken").getOrElse("")
    lazy val webappUrl = configuration.getStringProperty("id.webapp.url").getOrElse("")
  }

  object static {
    lazy val path =
      if (environment.secure) configuration.getMandatoryStringProperty("static.securePath")
      else configuration.getMandatoryStringProperty("static.path")
  }

  object images {
    lazy val path = configuration.getMandatoryStringProperty("images.path")
  }

  object assets {
    lazy val path =
      if (environment.secure) configuration.getMandatoryStringProperty("assets.securePath")
      else configuration.getMandatoryStringProperty("assets.path")
  }

  object staticSport {
    lazy val path = configuration.getMandatoryStringProperty("staticSport.path")
  }

  object sport {
    lazy val apiUrl = configuration.getStringProperty("sport.apiUrl").getOrElse(ajax.url)
  }

  object oas {
    lazy val siteIdHost = configuration.getStringProperty("oas.siteId.host").getOrElse(".guardian.co.uk")
    lazy val url = configuration.getStringProperty("oas.url").getOrElse("http://oas.theguardian.com/RealMedia/ads/")
  }

  object facebook {
    lazy val appId = configuration.getMandatoryStringProperty("guardian.page.fbAppId")
    lazy val imageFallback = "http://static-secure.guim.co.uk/icons/social/og/gu-logo-fallback.png"
  }

  object ios {
    lazy val ukAppId = "409128287"
    lazy val usAppId = "411493119"
  }

  object discussion {
    lazy val apiRoot = configuration.getMandatoryStringProperty("discussion.apiRoot")
    lazy val secureApiRoot = configuration.getMandatoryStringProperty("discussion.secureApiRoot")
    lazy val apiTimeout = configuration.getMandatoryStringProperty("discussion.apiTimeout")
    lazy val apiClientHeader = configuration.getMandatoryStringProperty("discussion.apiClientHeader")
    lazy val url = configuration.getMandatoryStringProperty("discussion.url")
  }
  
  object commercial {
    lazy val books_url = configuration.getMandatoryStringProperty("commercial.books_url")
    lazy val masterclasses_url = configuration.getMandatoryStringProperty("commercial.masterclasses_url")
    lazy val soulmates_url = configuration.getMandatoryStringProperty("commercial.soulmates_url")
    lazy val travel_url = configuration.getMandatoryStringProperty("commercial.travel_url")
  }

  object open {
    lazy val ctaApiRoot = configuration.getMandatoryStringProperty("open.cta.apiRoot")
  }

  object interactive {
    lazy val url = "http://interactive.guim.co.uk/next-gen/"
  }

  object javascript {
    // This is config that is avaliable to both Javascript and Scala
    // But does not change across environments
    // See https://issues.scala-lang.org/browse/SI-6723 for why we don't always use ->
    lazy val config: Map[String, String] = Map(
      "googleSearchUrl" -> "http://www.google.co.uk/cse/cse.js",
      "idWebAppUrl" -> id.webappUrl,
      "idApiUrl" -> id.apiRoot,
      "discussionApiRoot" -> discussion.apiRoot,
      ("secureDiscussionApiRoot", discussion.secureApiRoot),
      "discussionApiClientHeader" -> discussion.apiClientHeader,
      ("ophanJsUrl", ophan.jsLocation),
      ("googletagJsUrl", googletag.jsLocation)
    )

    lazy val pageData: Map[String, String] = {
      val keys = configuration.getPropertyNames.filter(_.startsWith("guardian.page."))
      keys.foldLeft(Map.empty[String, String]) {
        case (map, key) => map + (key -> configuration.getMandatoryStringProperty(key))
      }
    }
  }

  object front {
    lazy val config = configuration.getMandatoryStringProperty("front.config")
  }

  object facia {
    lazy val stage = configuration.getStringProperty("facia.stage").getOrElse(Configuration.environment.stage)
    lazy val collectionCap: Int = configuration.getIntegerProperty("facia.collection.cap").getOrElse(25)
  }

  object faciatool {
    lazy val contentApiPostEndpoint: Option[String] = configuration.getStringProperty("contentapi.post.endpoint")
    lazy val frontPressQueueUrl: Option[String] = configuration.getStringProperty("frontpress.sqs.queue")
    lazy val configBeforePressTimeout: Int = 1000
  }

  object pa {
    lazy val apiKey = configuration.getMandatoryStringProperty("pa.api.key")

    lazy val host = configuration.getStringProperty("football.api.host").getOrElse("http://pads6.pa-sport.com")
  }

  object memcached {
    lazy val host = configuration.getStringProperty("memcached.host")
  }

  object aws {
    private lazy val accessKey = configuration.getStringProperty("aws.access.key")
    private lazy val secretKey = configuration.getStringProperty("aws.access.secret.key")

    lazy val region = configuration.getMandatoryStringProperty("aws.region")
    lazy val bucket = configuration.getMandatoryStringProperty("aws.bucket")
    lazy val notificationSns: String = configuration.getMandatoryStringProperty("sns.notification.topic.arn")
    lazy val frontPressSns: Option[String] = configuration.getStringProperty("frontpress.sns.topic")

    lazy val credentials: AWSCredentialsProvider = new AWSCredentialsProviderChain(
      // the first 3 are a copy n paste job from the constructor of DefaultAWSCredentialsProviderChain
      new EnvironmentVariableCredentialsProvider(),
      new SystemPropertiesCredentialsProvider(),
      new InstanceProfileCredentialsProvider(),

      new StaticCredentialsProvider(new NullableAWSCredentials(accessKey, secretKey))
    )
  }

  object pingdom {
    lazy val url = configuration.getMandatoryStringProperty("pingdom.url")
    lazy val user = configuration.getMandatoryStringProperty("pingdom.user")
    lazy val password  = configuration.getMandatoryStringProperty("pingdom.password")
    lazy val apiKey = configuration.getMandatoryStringProperty("pingdom.apikey")
  }

  object riffraff {
    lazy val url = configuration.getMandatoryStringProperty("riffraff.url")
    lazy val apiKey = configuration.getMandatoryStringProperty("riffraff.apikey")
  }

  object formstack {
    lazy val url = configuration.getMandatoryStringProperty("formstack.url")
    lazy val oAuthToken = configuration.getMandatoryStringProperty("formstack.oauthToken")
  }

  object avatars {
    lazy val imageHost = configuration.getMandatoryStringProperty("avatars.image.host")
    lazy val signingKey = configuration.getMandatoryStringProperty("avatars.signing.key")
  }
}

object ManifestData {
  lazy val build = ManifestFile.asKeyValuePairs.getOrElse("Build", "DEV").dequote.trim
}

// AWSCredentialsProviderChain relies on these being null if not configured.
private class NullableAWSCredentials(accessKeyId: Option[String], secretKey: Option[String]) extends AWSCredentials{
  def getAWSAccessKeyId: String = accessKeyId.getOrElse(null)
  def getAWSSecretKey: String = secretKey.getOrElse(null)
}

