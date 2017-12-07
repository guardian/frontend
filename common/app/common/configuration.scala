package common

import java.io.{File, FileInputStream}
import java.nio.charset.Charset
import java.util.Map.Entry

import com.amazonaws.AmazonClientException
import com.amazonaws.auth._
import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.typesafe.config.{ConfigException, ConfigFactory}
import common.Environment.{app, awsRegion, stage}
import conf.switches.Switches
import conf.Static
import org.apache.commons.io.IOUtils
import services.ParameterStore

import scala.collection.JavaConverters._
import scala.concurrent.duration._
import scala.util.{Failure, Success, Try}

class BadConfigurationException(msg: String) extends RuntimeException(msg)

object Environment extends Logging {

  private[this] val installVars = {
    val source = new File("/etc/gu/install_vars") match {
      case f if f.exists => IOUtils.toString(new FileInputStream(f), Charset.defaultCharset())
      case _ => ""
    }

    Properties(source)
  }

  // Prefer env vars over install vars over default
  private[this] def get(name: String, default: String): String = {
    sys.env.get(name.toUpperCase).orElse(installVars.get(name)).getOrElse(default)
  }

  val stack = get("stack", "frontend")
  val app = get("app", "dev-build")
  val stage = get("STAGE", "DEV")
  val awsRegion = get("region", "eu-west-1")
  val configBucket = get("configBucket", "aws-frontend-store")

  log.info(s"Environment loaded as: stack=$stack, app=$app, stage=$stage, awsRegion=$awsRegion, configBucket=$configBucket")
}

/**
  * Main configuration
  *
  * Loaded remotely, but local overrides possible in an `/etc/gu/frontend.conf`
  * file under a `devOverrides` key. E.g:
  *
  *   devOverrides {
  *     switches.key=DEV/config/switches-yournamehere.properties
  *     facia.stage=CODE
  *   }
  */
object GuardianConfiguration extends Logging {

  import com.typesafe.config.Config

  private def configFromFile(path: String): Config = {
    val fileConfig = ConfigFactory.parseFileAnySyntax(new File(path))
    Try(fileConfig.getConfig(s"${app.toLowerCase}.${stage.toLowerCase}")).getOrElse(ConfigFactory.empty)
  }

  private def configFromParameterStore(path: String): Config = {
    val params = parameterStore.getPath(path)
    val configMap = params.map {
      case (key, value) => key.replaceFirst(s"$path/", "") -> value
    }
    ConfigFactory.parseMap(configMap.asJava)
  }

  lazy val parameterStore = new ParameterStore(awsRegion)

  lazy val configuration: Config = {
    if (stage == "DEVINFRA")
      ConfigFactory.parseResourcesAnySyntax("env/DEVINFRA.properties")
    else {
      val userPrivate = configFromFile(s"${System.getProperty("user.home")}/.gu/frontend.conf")
      val runtimeOnly =  configFromFile("/etc/gu/frontend.conf")
      val localConfig = userPrivate.withFallback(runtimeOnly)

      val frontendConfig = configFromParameterStore("/frontend")
      val frontendStageConfig = configFromParameterStore(s"/frontend/${stage.toLowerCase}")
      val frontendAppConfig = configFromParameterStore(s"/frontend/${stage.toLowerCase}/${app.toLowerCase}")

      localConfig
        .withFallback(frontendAppConfig)
        .withFallback(frontendStageConfig)
        .withFallback(frontendConfig)
    }
  }

  implicit class ScalaConvertProperties(conf: Config) {

    def getStringProperty: (String) => Option[String] = getProperty(conf.getString)_
    def getMandatoryStringProperty: (String) => String = getMandatoryProperty(conf.getString)_
    def getIntegerProperty: (String) => Option[Int] = getProperty(conf.getInt)_

    def getPropertyNames: Seq[String] = conf.entrySet.asScala.toSet.map((_.getKey): Entry[String, _] => String).toSeq
    def getStringPropertiesSplitByComma(propertyName: String): List[String] = {
      getStringProperty(propertyName) match {
        case Some(property) => (property split ",").toList
        case None => Nil
      }
    }

    def getMandatoryProperty[T](get: String => T)(property: String): T = getProperty(get)(property)
      .getOrElse(throw new BadConfigurationException(s"$property not configured"))
    def getProperty[T](get: String => T)(property: String): Option[T] =
      Try(get(property)) match {
          case Success(value) => Some(value)
          case Failure(_: ConfigException.Missing) => None
          case Failure(e) =>
            log.error(s"couldn't retrive $property", e)
            None
        }

  }

}

class GuardianConfiguration extends Logging {
  import GuardianConfiguration._

  case class OAuthCredentials(oauthClientId: String, oauthSecret: String, oauthCallback: String)
  case class OAuthCredentialsWithMultipleCallbacks(oauthClientId: String, oauthSecret: String, authorizedOauthCallbacks: List[String])

  object business {
    lazy val stocksEndpoint = configuration.getMandatoryStringProperty("business_data.url")
  }

  object feedback {
    lazy val feedpipeEndpoint = configuration.getMandatoryStringProperty("feedback.feedpipeEndpoint")
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
    lazy val stage = Environment.stage
    lazy val app = Environment.app

    lazy val isProd = stage.equalsIgnoreCase("prod")
    lazy val isCode = stage.equalsIgnoreCase("code")
    lazy val isDevInfra = stage.equalsIgnoreCase("devinfra")
    lazy val isNonProd = List("dev", "code", "gudev").contains(stage.toLowerCase)
    lazy val isNonDev = isProd || isCode || isDevInfra
  }

  object switches {
    lazy val key = configuration.getMandatoryStringProperty("switches.key")
  }

  object healthcheck {
    lazy val updateIntervalInSecs: Int = configuration.getIntegerProperty("healthcheck.updateIntervalInSecs").getOrElse(5)
  }

  object debug {
    lazy val enabled: Boolean = configuration.getStringProperty("debug.enabled").forall(_.toBoolean)
    lazy val beaconUrl: String = configuration.getStringProperty("beacon.url").getOrElse("")
  }

  override def toString: String = configuration.toString

  case class Auth(user: String, password: String)

  object contentApi {
    val contentApiHost: String = configuration.getMandatoryStringProperty("content.api.host")

    def contentApiDraftHost: String =
        configuration.getStringProperty("content.api.draft.host")
          .filter(_ => Switches.FaciaToolDraftContent.isSwitchedOn)
          .getOrElse(contentApiHost)

    val previewHost: String = configuration.getStringProperty("content.api.preview.host").getOrElse(contentApiHost)

    lazy val key: Option[String] = configuration.getStringProperty("content.api.key")
    lazy val timeout: FiniteDuration = Duration.create(configuration.getIntegerProperty("content.api.timeout.millis").getOrElse(2000), MILLISECONDS)

    lazy val circuitBreakerErrorThreshold: Int = configuration.getIntegerProperty("content.api.circuit_breaker.max_failures").getOrElse(30)
    lazy val circuitBreakerResetTimeout: FiniteDuration =
      FiniteDuration(configuration.getIntegerProperty("content.api.circuit_breaker.reset_timeout").getOrElse(2000), MILLISECONDS)

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
    lazy val thirdPartyAppsAccount = configuration.getStringProperty("guardian.page.thirdPartyAppsAccount").getOrElse("guardiangu-thirdpartyapps")
  }

  object googletag {
    lazy val jsLocation = configuration.getStringProperty("googletag.js.location").getOrElse("//www.googletagservices.com/tag/js/gpt.js")
  }

  object sonobi {
    //You can test your branch on CODE
    lazy val jsLocation = "//api.nextgen.guardianapps.co.uk/morpheus.theguardian.12919.js"
  }

  object frontend {
    lazy val store = configuration.getMandatoryStringProperty("frontend.store")
    lazy val webEngineersEmail = configuration.getStringProperty("email.web.engineers")
    lazy val dotcomPlatformEmail = configuration.getStringProperty("email.dotcom_platform")
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

  object teamcity {
    lazy val host = configuration.getMandatoryStringProperty("teamcity.host")
    lazy val internalHost = configuration.getMandatoryStringProperty("teamcity.internalhost")
  }

  object ajax {
    lazy val url = configuration.getStringProperty("ajax.url").getOrElse("")
    lazy val nonSecureUrl =
      configuration.getStringProperty("ajax.url").getOrElse("")
    lazy val corsOrigins: Seq[String] = configuration.getStringProperty("ajax.cors.origin").map(_.split(",")
      .map(_.trim).toSeq).getOrElse(Nil)
  }

  object amp {
    private lazy val scheme = configuration.getStringProperty("amp.scheme").getOrElse("")
    lazy val host = configuration.getStringProperty("amp.host").getOrElse("")
    lazy val baseUrl = scheme + host
  }

  object id {
    lazy val url = configuration.getStringProperty("id.url").getOrElse("")
    lazy val apiRoot = configuration.getStringProperty("id.apiRoot").getOrElse("")
    lazy val domain = """^https?://(?:profile\.)?([^/:]+)""".r.unapplySeq(url).flatMap(_.headOption).getOrElse("theguardian.com")
    lazy val apiClientToken = configuration.getStringProperty("id.apiClientToken").getOrElse("")
    lazy val oauthUrl = configuration.getStringProperty("id.oauth.url").getOrElse("")
    lazy val membershipUrl = configuration.getStringProperty("id.membership.url").getOrElse("https://membership.theguardian.com")
    lazy val supportUrl = configuration.getStringProperty("id.support.url").getOrElse("https://support.theguardian.com")
    lazy val subscribeUrl = configuration.getStringProperty("id.digitalpack.url").getOrElse("https://subscribe.theguardian.com")
    lazy val contributeUrl = configuration.getStringProperty("id.contribute.url").getOrElse("https://contribute.theguardian.com")
    lazy val membersDataApiUrl = configuration.getStringProperty("id.members-data-api.url").getOrElse("https://members-data-api.theguardian.com")
    lazy val stripePublicToken =  configuration.getStringProperty("id.membership.stripePublicToken").getOrElse("")
    lazy val accountDeletionApiKey = configuration.getStringProperty("id.accountDeletion.apiKey").getOrElse("")
    lazy val accountDeletionApiRoot = configuration.getStringProperty("id.accountDeletion.apiRoot").getOrElse("")
  }

  object images {
    lazy val path = configuration.getMandatoryStringProperty("images.path")
    val fallbackLogo = Static("images/fallback-logo.png")
    object backends {
      lazy val mediaToken: String = configuration.getMandatoryStringProperty("images.media.token")
      lazy val staticToken: String = configuration.getMandatoryStringProperty("images.static.token")
      lazy val uploadsToken: String = configuration.getMandatoryStringProperty("images.uploads.token")
    }
  }

  object headlines {
    lazy val spreadsheet = configuration.getMandatoryStringProperty("headlines.spreadsheet")
  }

  object assets {
    lazy val path = configuration.getMandatoryStringProperty("assets.path")

    // This configuration value determines if this server will load and resolve assets using the asset map.
    // Set this to true if you want to run the Play server in dev, and emulate prod mode asset-loading.
    // If true in dev, assets are locally loaded from the `hash` build output, otherwise assets come from 'target' for css, and 'src' for js.
    lazy val useHashedBundles =  configuration.getStringProperty("assets.useHashedBundles")
      .map(_.toBoolean)
      .getOrElse(environment.isNonDev)
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
    object pages {
      lazy val authorisedIdsForLinkEdits = configuration.getStringPropertiesSplitByComma("facebook.pages.authorisedIdsForLinkEdits")
    }
    object graphApi {
      lazy val version = configuration.getStringProperty("facebook.graphApi.version").getOrElse("2.8")
      lazy val accessToken = configuration.getMandatoryStringProperty("facebook.graphApi.accessToken")
    }
  }

  object ios {
    lazy val ukAppId = "409128287"
    lazy val usAppId = "411493119"
  }

  object discussion {
    lazy val apiRoot = configuration.getMandatoryStringProperty("guardian.page.discussionApiUrl")
    lazy val apiTimeout = configuration.getMandatoryStringProperty("discussion.apiTimeout")
    lazy val apiClientHeader = configuration.getMandatoryStringProperty("discussion.apiClientHeader")
    lazy val d2Uid = configuration.getMandatoryStringProperty("discussion.d2Uid")
    lazy val frontendAssetsMap = configuration.getStringProperty("discussion.frontend.assetsMap")
    lazy val frontendAssetsMapRefreshInterval = 5.seconds
    lazy val frontendAssetsVersion = "v1.5.0"
  }

  object witness {
    lazy val witnessApiRoot = configuration.getMandatoryStringProperty("witness.apiRoot")
  }

  object commercial {

    lazy val testDomain =
      if (environment.isProd) "http://m.code.dev-theguardian.com"
      else configuration.getStringProperty("guardian.page.host") getOrElse ""

    lazy val dfpAdUnitGuRoot = configuration.getMandatoryStringProperty("guardian.page.dfpAdUnitRoot")
    lazy val dfpFacebookIaAdUnitRoot = configuration.getMandatoryStringProperty("guardian.page.dfp.facebookIaAdUnitRoot")
    lazy val dfpMobileAppsAdUnitRoot = configuration.getMandatoryStringProperty("guardian.page.dfp.mobileAppsAdUnitRoot")
    lazy val dfpAccountId = configuration.getMandatoryStringProperty("guardian.page.dfpAccountId")

    lazy val books_url = configuration.getMandatoryStringProperty("commercial.books_url")
    lazy val masterclasses_url =
      configuration.getMandatoryStringProperty("commercial.masterclasses_url")
    lazy val soulmates_url = configuration.getMandatoryStringProperty("commercial.soulmates_url")
    lazy val soulmatesApiUrl = configuration.getStringProperty("soulmates.api.url")
    lazy val travelFeedUrl = configuration.getStringProperty("travel.feed.url")
    lazy val guMerchandisingAdvertiserId =
      configuration.getMandatoryStringProperty("commercial.dfp.guMerchandising.advertiserId")

    // root dir relative to S3 bucket
    lazy val commercialRoot = {
      configuration.getStringProperty("commercial.s3.root") getOrElse s"${environment.stage.toUpperCase}/commercial"
    }

    private lazy val dfpRoot = s"$commercialRoot/dfp"
    lazy val dfpInlineMerchandisingTagsDataKey = s"$dfpRoot/inline-merchandising-tags-v3.json"
    lazy val dfpHighMerchandisingTagsDataKey = s"$dfpRoot/high-merchandising-tags.json"
    lazy val dfpPageSkinnedAdUnitsKey = s"$dfpRoot/pageskinned-adunits-v6.json"
    lazy val dfpLineItemsKey = s"$dfpRoot/lineitems-v6.json"
    lazy val dfpActiveAdUnitListKey = s"$dfpRoot/active-ad-units.csv"
    lazy val dfpMobileAppsAdUnitListKey = s"$dfpRoot/mobile-active-ad-units.csv"
    lazy val dfpFacebookIaAdUnitListKey = s"$dfpRoot/facebookia-active-ad-units.csv"
    lazy val dfpTemplateCreativesKey = s"$dfpRoot/template-creatives.json"
    lazy val dfpCustomTargetingKey = s"$dfpRoot/custom-targeting-key-values.json"
    lazy val topAboveNavSlotTakeoversKey = s"$dfpRoot/top-above-nav-slot-takeovers-v2.json"
    lazy val adsTextObjectKey = s"$commercialRoot/ads.txt"
    lazy val takeoversWithEmptyMPUsKey = s"$commercialRoot/takeovers-with-empty-mpus.json"

    private lazy val merchandisingFeedsRoot = s"$commercialRoot/merchandising"
    lazy val merchandisingFeedsLatest = s"$merchandisingFeedsRoot/latest"

    lazy val masterclassesToken = configuration.getStringProperty("masterclasses.token")
    lazy val liveEventsToken = configuration.getStringProperty("live-events.token")
    lazy val liveEventsMembershipUrl = "https://membership.theguardian.com/events.json"
    lazy val jobsUrl= configuration.getStringProperty("jobs.api.url")

    object magento {
      lazy val domain = configuration.getStringProperty("magento.domain")
      lazy val consumerKey = configuration.getStringProperty("magento.consumer.key")
      lazy val consumerSecret = configuration.getStringProperty("magento.consumer.secret")
      lazy val accessToken = configuration.getStringProperty("magento.access.token.key")
      lazy val accessTokenSecret = configuration.getStringProperty("magento.access.token.secret")
      lazy val authorizationPath = configuration.getStringProperty("magento.auth.path")
      lazy val isbnLookupPath = configuration.getStringProperty("magento.isbn.lookup.path")
    }

    lazy val adOpsTeam = configuration.getStringProperty("email.adOpsTeam")
    lazy val adOpsAuTeam = configuration.getStringProperty("email.adOpsTeamAu")
    lazy val adOpsUsTeam = configuration.getStringProperty("email.adOpsTeamUs")
    lazy val adTechTeam = configuration.getStringProperty("email.adTechTeam")
    lazy val gLabsTeam = configuration.getStringProperty("email.gLabsTeam")

    lazy val expiredPaidContentUrl = s"${site.host}/info/2015/feb/06/paid-content-removal-policy"
  }

  object interactive {
    lazy val cdnPath = "https://interactive.guim.co.uk"
    lazy val url = s"$cdnPath/next-gen/"
  }

  object javascript {
    // This is config that is avaliable to both Javascript and Scala
    // But does not change across environments.
    lazy val config: Map[String, String] = Map(
      ("googleSearchUrl", "//www.google.co.uk/cse/cse.js"),
      ("idApiUrl", id.apiRoot),
      ("idOAuthUrl", id.oauthUrl),
      ("discussionApiClientHeader", discussion.apiClientHeader),
      ("discussionD2Uid", discussion.d2Uid),
      ("ophanJsUrl", ophan.jsLocation),
      ("ophanEmbedJsUrl", ophan.embedJsLocation),
      ("googletagJsUrl", googletag.jsLocation),
      ("membershipUrl", id.membershipUrl),
      ("supportUrl", id.supportUrl),
      ("stripePublicToken", id.stripePublicToken),
      ("sonobiHeaderBiddingJsUrl", sonobi.jsLocation)
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

  object targeting {
    lazy val campaignsUrl = configuration.getStringProperty("targeting.campaignsUrl")
  }

  object facia {
    lazy val stage = configuration.getStringProperty("facia.stage").getOrElse(environment.stage)
    lazy val collectionCap: Int = 20
  }

  object faciatool {
    lazy val crossAccountSourceBucket = configuration.getMandatoryStringProperty("aws.cmsFronts.frontCollections.bucket")
    lazy val outputBucket = configuration.getMandatoryStringProperty("aws.bucket")

    lazy val frontPressCronQueue = configuration.getStringProperty("frontpress.sqs.cron_queue_url")
    lazy val frontPressToolQueue = configuration.getStringProperty("frontpress.sqs.tool_queue_url")
    lazy val frontPressStatusNotificationStream = configuration.getStringProperty("frontpress.kinesis.status_notification_stream")

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

    lazy val stsRoleToAssume = configuration.getStringProperty("aws.cmsFronts.account.role")

    def crossAccountMandatoryCredentials: AWSCredentialsProvider =
      crossAccountCredentials.getOrElse(throw new BadConfigurationException("AWS credentials for cross account are not configured"))

    lazy val crossAccountCredentials: Option[AWSCredentialsProvider] = faciatool.stsRoleToAssume.flatMap { role =>
      val provider = new AWSCredentialsProviderChain(
        new ProfileCredentialsProvider("cmsFronts"),
        new STSAssumeRoleSessionCredentialsProvider.Builder(role, "frontend").build()
      )

      // this is a bit of a convoluted way to check whether we actually have credentials.
      // I guess in an ideal world there would be some sort of isConfigued() method...
      try {
        provider.getCredentials
        Some(provider)
      } catch {
        case ex: AmazonClientException =>
          log.error("amazon client cross account exception", ex)
          throw ex
      }
    }
  }

  object r2Press {
    lazy val sqsQueueUrl = configuration.getStringProperty("admin.r2.page.press.sqs.queue.url")
    lazy val sqsTakedownQueueUrl = configuration.getStringProperty("admin.r2.page.press.takedown.sqs.queue.url")
    lazy val pressRateInSeconds = configuration.getIntegerProperty("admin.r2.page.press.rate.seconds").getOrElse(60)
    lazy val pressQueueWaitTimeInSeconds = configuration.getIntegerProperty("admin.r2.press.queue.wait.seconds").getOrElse(10)
    lazy val pressQueueMaxMessages = configuration.getIntegerProperty("admin.r2.press.queue.max.messages").getOrElse(10)
    lazy val fallbackCachebustId = configuration.getStringProperty("admin.r2.press.fallback.cachebust.id").getOrElse("")
  }

  object redis {
    lazy val endpoint = configuration.getStringProperty("redis.host")
  }

  object aws {

    lazy val region = configuration.getMandatoryStringProperty("aws.region")
    lazy val bucket = configuration.getMandatoryStringProperty("aws.bucket")
    lazy val notificationSns: String = configuration.getMandatoryStringProperty("sns.notification.topic.arn")
    lazy val videoEncodingsSns: String = configuration.getMandatoryStringProperty("sns.missing_video_encodings.topic.arn")
    lazy val frontPressSns: Option[String] = configuration.getStringProperty("frontpress.sns.topic")
    lazy val r2PressSns: Option[String] = configuration.getStringProperty("r2press.sns.topic")
    lazy val r2PressTakedownSns: Option[String] = configuration.getStringProperty("r2press.takedown.sns.topic")

    def mandatoryCredentials: AWSCredentialsProvider = credentials.getOrElse(throw new BadConfigurationException("AWS credentials are not configured"))
    val credentials: Option[AWSCredentialsProvider] = {
      val provider = new AWSCredentialsProviderChain(
        new ProfileCredentialsProvider("frontend"),
        InstanceProfileCredentialsProvider.getInstance()
      )

      // this is a bit of a convoluted way to check whether we actually have credentials.
      // I guess in an ideal world there would be some sort of isConfigued() method...
      try {
        provider.getCredentials
        Some(provider)
      } catch {
        case ex: AmazonClientException =>
          log.error(ex.getMessage, ex)
          throw ex
      }
    }
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

  object NewsAlert {
    lazy val apiKey = configuration.getStringProperty("news-alert.api.key")
  }

  object Logstash {
    lazy val enabled = configuration.getStringProperty("logstash.enabled").exists(_.toBoolean)
    lazy val stream = configuration.getStringProperty("logstash.stream.name")
    lazy val streamRegion = configuration.getStringProperty("logstash.stream.region")
  }

  object Elk {
    lazy val kibanaUrl = configuration.getStringProperty("elk.kibana.url")
  }

  object Survey {
    lazy val formStackAccountName: String = "guardiannewsampampmedia"
  }

  object Media {
    lazy val externalEmbedHost = configuration.getMandatoryStringProperty("guardian.page.externalEmbedHost")
  }

}

object ManifestData {
  lazy val build = ManifestFile.asKeyValuePairs.getOrElse("Build", "DEV").dequote.trim
  lazy val revision = ManifestFile.asKeyValuePairs.getOrElse("Revision", "DEV").dequote.trim
}
