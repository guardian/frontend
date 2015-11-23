package common

import java.io.{File, FileInputStream}

import com.amazonaws.AmazonClientException
import com.amazonaws.auth._
import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.gu.conf.ConfigurationFactory
import conf.switches.Switches
import conf.{Configuration, Static}
import org.apache.commons.io.IOUtils
import play.api.Play
import play.api.Play.current

import scala.util.Try

class BadConfigurationException(msg: String) extends RuntimeException(msg)

class GuardianConfiguration(val application: String, val webappConfDirectory: String = "env") extends Logging {

  case class OAuthCredentials(oauthClientId: String, oauthSecret: String, oauthCallback: String)

  protected val configuration = ConfigurationFactory.getNonLoggingConfiguration(application, webappConfDirectory)

  private implicit class OptionalString2MandatoryString(conf: com.gu.conf.Configuration) {
    def getMandatoryStringProperty(property: String) = configuration.getStringProperty(property)
      .getOrElse(throw new BadConfigurationException(s"$property not configured"))
  }

  object business {
    lazy val stocksEndpoint = configuration.getMandatoryStringProperty("business_data.url")
  }

  object weather {
    lazy val apiKey = configuration.getStringProperty("weather.api.key")
  }

  object indexes {
    lazy val tagIndexesBucket =
      configuration.getMandatoryStringProperty("tag_indexes.bucket")

    lazy val adminRebuildIndexRateInMinutes =
      configuration.getIntegerProperty("tag_indexes.rebuild_rate_in_minutes").getOrElse(60)
  }

  object environment {
    private val installVars = new File("/etc/gu/install_vars") match {
      case f if f.exists => IOUtils.toString(new FileInputStream(f))
      case _ => ""
    }

    private val properties = Properties(installVars)

    def apply(key: String, default: String) = properties.getOrElse(key, default).toLowerCase

    val stage = apply("STAGE", "unknown")

    lazy val projectName = Play.application.configuration.getString("guardian.projectName").getOrElse("frontend")
    lazy val secure = Play.application.configuration.getBoolean("guardian.secure").getOrElse(false)

    lazy val isProd = stage.equalsIgnoreCase("prod")
    lazy val isNonProd = List("dev", "code", "gudev").contains(stage.toLowerCase)

    lazy val isPreview = projectName == "preview"
  }

  object switches {
    lazy val key = configuration.getMandatoryStringProperty("switches.key")
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
    val contentApiLiveHost: String = configuration.getMandatoryStringProperty("content.api.host")

    def contentApiDraftHost: String =
        configuration.getStringProperty("content.api.draft.host")
          .filter(_ => Switches.FaciaToolDraftContent.isSwitchedOn)
          .getOrElse(contentApiLiveHost)

    lazy val key: Option[String] = configuration.getStringProperty("content.api.key")
    lazy val timeout: Int = configuration.getIntegerProperty("content.api.timeout.millis").getOrElse(2000)

    lazy val circuitBreakerErrorThreshold =
      configuration.getIntegerProperty("content.api.circuit_breaker.max_failures").getOrElse(5)

    lazy val circuitBreakerResetTimeout =
      configuration.getIntegerProperty("content.api.circuit_breaker.reset_timeout").getOrElse(20000)

    lazy val previewAuth: Option[Auth] = for {
      user <- configuration.getStringProperty("content.api.preview.user")
      password <- configuration.getStringProperty("content.api.preview.password")
    } yield Auth(user, password)
  }

  object ophanApi {
    lazy val key = configuration.getStringProperty("ophan.api.key")
    lazy val host = configuration.getStringProperty("ophan.api.host")
  }

  object ophan {
    lazy val jsLocation = configuration.getStringProperty("ophan.js.location").getOrElse("//j.ophan.co.uk/ophan.ng")
    lazy val embedJsLocation = configuration.getStringProperty("ophan.embed.js.location").getOrElse("//j.ophan.co.uk/ophan.embed")
  }

  object omniture {
    lazy val account = configuration.getStringProperty("guardian.page.omnitureAccount").getOrElse("guardiangu-network")
    lazy val ampAccount = configuration.getStringProperty("guardian.page.omnitureAmpAccount").getOrElse("guardiangudev-code")
  }

  object googletag {
    lazy val jsLocation = configuration.getStringProperty("googletag.js.location").getOrElse("//www.googletagservices.com/tag/js/gpt.js")
  }

  object frontend {
    lazy val store = configuration.getMandatoryStringProperty("frontend.store")
    lazy val webEngineersEmail = configuration.getStringProperty("email.web.engineers")
  }

  object site {
    lazy val host = configuration.getStringProperty("guardian.page.host").getOrElse("")
  }

  object cookies {
    lazy val lastSeenKey: String = "lastseen"
    lazy val sessionExpiryTime = configuration.getIntegerProperty("auth.timeout").getOrElse(60000)
  }

  object db {
    lazy val sentry_db_driver = configuration.getStringProperty("db.sentry.driver").getOrElse("")
    lazy val sentry_db_url = configuration.getStringProperty("db.sentry.url").getOrElse("")
    lazy val sentry_db_username = configuration.getStringProperty("db.sentry.user").getOrElse("")
    lazy val sentry_db_password = configuration.getStringProperty("db.sentry.password").getOrElse("")
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
    lazy val nonSecureUrl =
      configuration.getStringProperty("ajax.url").getOrElse("")
    lazy val corsOrigins: Seq[String] = configuration.getStringProperty("ajax.cors.origin").map(_.split(",")
      .map(_.trim).toSeq).getOrElse(Nil)
  }

  object id {
    lazy val url = configuration.getStringProperty("id.url").getOrElse("")
    lazy val apiRoot = configuration.getStringProperty("id.apiRoot").getOrElse("")
    lazy val domain = """^https?://(?:profile\.)?([^/:]+)""".r.unapplySeq(url).flatMap(_.headOption).getOrElse("theguardian.com")
    lazy val apiClientToken = configuration.getStringProperty("id.apiClientToken").getOrElse("")
    lazy val oauthUrl = configuration.getStringProperty("id.oauth.url").getOrElse("")
    lazy val membershipUrl = configuration.getStringProperty("id.membership.url").getOrElse("membership.theguardian.com")
    lazy val digitalPackUrl = configuration.getStringProperty("id.membership.url").getOrElse("subscribe.theguardian.com")
    lazy val stripePublicToken =  configuration.getStringProperty("id.membership.stripePublicToken").getOrElse("")
  }

  object static {
    lazy val path =
      if (environment.secure) configuration.getMandatoryStringProperty("static.securePath")
      else configuration.getMandatoryStringProperty("static.path")
  }

  object images {
    lazy val path = configuration.getMandatoryStringProperty("images.path")
    object backends {
      lazy val mediaToken: String = configuration.getMandatoryStringProperty("images.media.token")
      lazy val staticToken: String = configuration.getMandatoryStringProperty("images.static.token")
    }
  }

  object headlines {
    lazy val spreadsheet = configuration.getMandatoryStringProperty("headlines.spreadsheet")
  }

  object assets {
    lazy val path = configuration.getMandatoryStringProperty("assets.path")
  }

  object staticSport {
    lazy val path = configuration.getMandatoryStringProperty("staticSport.path")
  }

  object sport {
    lazy val apiUrl = configuration.getStringProperty("sport.apiUrl").getOrElse(ajax.nonSecureUrl)
  }

  object oas {
    lazy val siteIdHost = configuration.getStringProperty("oas.siteId.host").getOrElse(".guardian.co.uk")
    lazy val url = configuration.getStringProperty("oas.url").getOrElse("http://oas.theguardian.com/RealMedia/ads/")
  }

  object facebook {
    lazy val appId = configuration.getMandatoryStringProperty("guardian.page.fbAppId")
    lazy val imageFallback = Static("images/facebook/fallback-logo.png").path
  }

  object ios {
    lazy val ukAppId = "409128287"
    lazy val usAppId = "411493119"
  }

  object discussion {
    lazy val apiRoot = configuration.getMandatoryStringProperty("discussion.apiRoot")
    lazy val apiTimeout = configuration.getMandatoryStringProperty("discussion.apiTimeout")
    lazy val apiClientHeader = configuration.getMandatoryStringProperty("discussion.apiClientHeader")
    lazy val url = configuration.getMandatoryStringProperty("discussion.url")
  }

  object witness {
    lazy val witnessApiRoot = configuration.getMandatoryStringProperty("witness.apiRoot")
  }

  object commercial {
    lazy val dfpAdUnitRoot = configuration.getMandatoryStringProperty("guardian.page.dfpAdUnitRoot")
    lazy val dfpAccountId = configuration.getMandatoryStringProperty("guardian.page.dfpAccountId")
    lazy val books_url = configuration.getMandatoryStringProperty("commercial.books_url")
    lazy val masterclasses_url =
      configuration.getMandatoryStringProperty("commercial.masterclasses_url")
    lazy val soulmates_url = configuration.getMandatoryStringProperty("commercial.soulmates_url")
    lazy val travel_url = configuration.getMandatoryStringProperty("commercial.travel_url")
    lazy val traveloffers_url =
      configuration.getStringProperty("traveloffers.api.url") map (u => s"$u/consumerfeed")
    lazy val guMerchandisingAdvertiserId =
      configuration.getMandatoryStringProperty("commercial.dfp.guMerchandising.advertiserId")

    private lazy val commercialRoot = s"${environment.stage.toUpperCase}/commercial"

    private lazy val dfpRoot = s"$commercialRoot/dfp"
    lazy val dfpPaidForTagsDataKey = s"$dfpRoot/paid-for-tags-v4.json"
    lazy val dfpInlineMerchandisingTagsDataKey = s"$dfpRoot/inline-merchandising-tags-v3.json"
    lazy val dfpPageSkinnedAdUnitsKey = s"$dfpRoot/pageskinned-adunits-v6.json"
    lazy val dfpLineItemsKey = s"$dfpRoot/lineitems-v4.json"
    lazy val dfpActiveAdUnitListKey = s"$dfpRoot/active-ad-units.csv"
    lazy val dfpTemplateCreativesKey = s"$dfpRoot/template-creatives.json"
    lazy val topAboveNavSlotTakeoversKey = s"$dfpRoot/top-above-nav-slot-takeovers-v1.json"
    lazy val topBelowNavSlotTakeoversKey = s"$dfpRoot/top-below-nav-slot-takeovers-v1.json"
    lazy val topSlotTakeoversKey = s"$dfpRoot/top-slot-takeovers-v1.json"

    lazy val takeoversWithEmptyMPUsKey = s"$commercialRoot/takeovers-with-empty-mpus.json"

    lazy val travelOffersS3Key = s"${environment.stage.toUpperCase}/commercial/cache/traveloffers.xml"

    object magento {
      lazy val domain = configuration.getStringProperty("magento.domain")
      lazy val consumerKey = configuration.getStringProperty("magento.consumer.key")
      lazy val consumerSecret = configuration.getStringProperty("magento.consumer.secret")
      lazy val accessToken = configuration.getStringProperty("magento.access.token")
      lazy val accessTokenSecret = configuration.getStringProperty("magento.access.token.secret")
      lazy val authorizationPath = configuration.getStringProperty("magento.auth.path")
      lazy val isbnLookupPath = configuration.getStringProperty("magento.isbn.lookup.path")
    }

    lazy val adOpsTeam = configuration.getStringProperty("email.adOpsTeam")
    lazy val adOpsAuTeam = configuration.getStringProperty("email.adOpsTeam.au")
    lazy val adOpsUsTeam = configuration.getStringProperty("email.adOpsTeam.us")
    lazy val adTechTeam = configuration.getStringProperty("email.adTechTeam")
    lazy val gLabsTeam = configuration.getStringProperty("email.gLabsTeam")

    lazy val expiredAdFeatureUrl = s"${site.host}/info/2015/feb/06/paid-content-removal-policy"

    lazy val showMpuInAllContainersPageId =
      configuration.getStringProperty("commercial.showMpuInAllContainersPageId")
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
      "googleSearchUrl" -> "//www.google.co.uk/cse/cse.js",
      "idApiUrl" -> id.apiRoot,
      "idOAuthUrl" -> id.oauthUrl,
      "discussionApiRoot" -> discussion.apiRoot,
      "discussionApiClientHeader" -> discussion.apiClientHeader,
      ("ophanJsUrl", ophan.jsLocation),
      ("ophanEmbedJsUrl", ophan.embedJsLocation),
      ("googletagJsUrl", googletag.jsLocation),
      ("membershipUrl", id.membershipUrl),
      ("stripePublicToken", id.stripePublicToken)
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
    lazy val collectionCap: Int = 35
  }

  object faciatool {
    lazy val frontPressCronQueue = configuration.getStringProperty("frontpress.sqs.cron_queue_url")
    lazy val frontPressToolQueue = configuration.getStringProperty("frontpress.sqs.tool_queue_url")

    lazy val configBeforePressTimeout: Int = 1000

    val showTestContainers =
      configuration.getStringProperty("faciatool.show_test_containers").contains("true")

    lazy val adminPressJobStandardPushRateInMinutes: Int =
      Try(configuration.getStringProperty("admin.pressjob.standard.push.rate.inminutes").get.toInt)
        .getOrElse(5)

    lazy val adminPressJobHighPushRateInMinutes: Int =
      Try(configuration.getStringProperty("admin.pressjob.high.push.rate.inminutes").get.toInt)
        .getOrElse(1)

    lazy val adminPressJobLowPushRateInMinutes: Int =
      Try(configuration.getStringProperty("admin.pressjob.low.push.rate.inminutes").get.toInt)
        .getOrElse(60)

  }

  object memcached {
    lazy val host = configuration.getStringProperty("memcached.host")
  }

  object aws {

    lazy val region = configuration.getMandatoryStringProperty("aws.region")
    lazy val bucket = configuration.getMandatoryStringProperty("aws.bucket")
    lazy val notificationSns: String = configuration.getMandatoryStringProperty("sns.notification.topic.arn")
    lazy val videoEncodingsSns: String = configuration.getMandatoryStringProperty("sns.missing_video_encodings.topic.arn")
    lazy val frontPressSns: Option[String] = configuration.getStringProperty("frontpress.sns.topic")


    def mandatoryCredentials: AWSCredentialsProvider = credentials.getOrElse(throw new BadConfigurationException("AWS credentials are not configured"))
    val credentials: Option[AWSCredentialsProvider] = {
      val provider = new AWSCredentialsProviderChain(
        new EnvironmentVariableCredentialsProvider(),
        new SystemPropertiesCredentialsProvider(),
        new ProfileCredentialsProvider("nextgen"),
        new InstanceProfileCredentialsProvider
      )

      // this is a bit of a convoluted way to check whether we actually have credentials.
      // I guess in an ideal world there would be some sort of isConfigued() method...
      try {
        provider.getCredentials
        Some(provider)
      } catch {
        case ex: AmazonClientException =>
          log.error(ex.getMessage, ex)

          // We really, really want to ensure that PROD is configured before saying a box is OK
          if (Play.isProd) throw ex
          // this means that on dev machines you only need to configure keys if you are actually going to use them
          None
      }
    }
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

  object standalone {
    lazy val oauthCredentials: Option[OAuthCredentials] = for {
      oauthClientId <- configuration.getStringProperty("standalone.oauth.clientid")
      // TODO needs the orElse fallback till we roll out new properties files
      oauthSecret <- configuration.getStringProperty("standalone.oauth.secret").orElse(configuration.getStringProperty("preview.oauth.secret"))
      oauthCallback <- configuration.getStringProperty("standalone.oauth.callback")
    } yield OAuthCredentials(oauthClientId, oauthSecret, oauthCallback)
  }

  object pngResizer {
    val cacheTimeInSeconds = configuration.getIntegerProperty("png_resizer.image_cache_time").getOrElse(86400)
    val ttlInSeconds = configuration.getIntegerProperty("png_resizer.image_ttl").getOrElse(86400)
  }

  object emailSignup {
    val url = configuration.getMandatoryStringProperty("email.signup.url")
  }
}

object ManifestData {
  lazy val build = ManifestFile.asKeyValuePairs.getOrElse("Build", "DEV").dequote.trim
  lazy val revision = ManifestFile.asKeyValuePairs.getOrElse("Revision", "DEV").dequote.trim
}
