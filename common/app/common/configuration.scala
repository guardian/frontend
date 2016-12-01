package common

import java.io.{File, FileInputStream}
import java.util.Map.Entry

import com.amazonaws.AmazonClientException
import com.amazonaws.auth._
import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.gu.cm.{ClassPathConfigurationSource, FileConfigurationSource, PlayDefaultLogger, _}
import com.typesafe.config.ConfigException
import conf.switches.Switches
import conf.{Configuration, Static}
import org.apache.commons.io.IOUtils
import play.api.{Environment, Configuration => PlayConfiguration}
import play.api.Mode.Prod

import scala.collection.JavaConversions._
import scala.concurrent.duration._
import scala.util.{Failure, Success, Try}

class BadConfigurationException(msg: String) extends RuntimeException(msg)

object InstallVars {

  val installVars = new File("/etc/gu/install_vars") match {
      case f if f.exists => IOUtils.toString(new FileInputStream(f))
      case _ => ""
    }

  val properties = Properties(installVars)

  def apply(key: String, default: String) = properties.getOrElse(key, default)

  object InstallationVars {
    val stack = apply("stack", "frontend")
    // if got config at app startup, we wouldn't need to configure it
    val app = apply("app", "dev-build")
    val stage = apply("STAGE", "DEV")
    val awsRegion = apply("region", "eu-west-1")
    val configBucket = apply("configBucket", "aws-frontend-store")
    if (stage == "DEV" && new File(s"${System.getProperty("user.home")}/.gu/frontend.properties").exists) {
    throw new RuntimeException(
      "\n\nYou have a file ~/.gu/frontend.properties with secrets - please delete that file and any copies as it is not needed.\n  " +
      "All secrets are now stored in S3 bucket aws-frontend-store, not on your laptop.\n\n  " +
      "Should you need to override any properties in DEV, create a new file ~/.gu/frontend.conf. \n" +
      "For an example see https://github.com/guardian/frontend/blob/master/common/app/common/configuration.scala#L48\n" +
      "For details of the changes see https://github.com/guardian/frontend/pull/14081")
    /*
    ~/.gu/frontend.conf example file:

    # local development (DEV stage) config overrides (not secrets)
    devOverrides {
      switches.key=DEV/config/switches-yournamehere.properties
      facia.stage=CODE
    }

     */
    }
  }
}

object GuardianConfiguration extends Logging {

  import com.gu.cm.{Configuration => CM}
  import com.typesafe.config.Config
  import InstallVars.InstallationVars._

  lazy val guardianConfiguration: Config = {
    // This is version number of the config file we read from s3,
    // increment this if you publish a new version of config
    val s3ConfigVersion = 12

    lazy val userPrivate = FileConfigurationSource(s"${System.getProperty("user.home")}/.gu/frontend.conf")
    lazy val runtimeOnly = FileConfigurationSource("/etc/gu/frontend.conf")
    lazy val identity = AwsApplication(stack, app, stage, awsRegion)
    lazy val commonS3Config = S3ConfigurationSource(identity, configBucket, Configuration.aws.mandatoryCredentials, Some(s3ConfigVersion))
    lazy val config = new CM(List(userPrivate, runtimeOnly, commonS3Config), PlayDefaultLogger).load.resolve

    // test mode is self contained and won't need to use anything secret
    lazy val test = ClassPathConfigurationSource("env/DEVINFRA.properties")
    lazy val testConfig = new CM(List(test), PlayDefaultLogger).load.resolve

    val appConfig =
      if (stage == "DEVINFRA") testConfig
      else {
        try {
          config.getConfig(identity.app + "." + identity.stage)
        } catch {
          case e: ConfigException if stage == "DEV" =>
            throw new RuntimeException(s"${e.getMessage}.  You probably need to refresh your credentials.", e)
        }
      }
    appConfig
  }

  implicit class ScalaConvertProperties(conf: Config) {

    def getStringProperty = getProperty(conf.getString)_
    def getMandatoryStringProperty = getMandatoryProperty(conf.getString)_
    def getIntegerProperty = getProperty(conf.getInt)_

    def getPropertyNames: Seq[String] = conf.entrySet.toSet.map((_.getKey): Entry[String, _] => String).toSeq
    def getStringPropertiesSplitByComma(propertyName: String): List[String] = {
      getStringProperty(propertyName) match {
        case Some(property) => (property split ",").toList
        case None => Nil
      }
    }

    def getMandatoryProperty[T](get: String => T)(property: String) = getProperty(get)(property)
      .getOrElse(throw new BadConfigurationException(s"$property not configured"))
    def getProperty[T](get: String => T)(property: String): Option[T] =
      Try(get(property)) match {
          case Success(value) => Some(value)
          case Failure(e: ConfigException.Missing) => None
          case Failure(e) =>
            log.error(s"couldn't retrive $property", e)
            None
        }

  }

}

class GuardianConfiguration(playConfiguration: PlayConfiguration, playEnvironment: Environment) extends Logging {
  import GuardianConfiguration._

  case class OAuthCredentials(oauthClientId: String, oauthSecret: String, oauthCallback: String)
  case class OAuthCredentialsWithMultipleCallbacks(oauthClientId: String, oauthSecret: String, authorizedOauthCallbacks: List[String])

  object business {
    lazy val stocksEndpoint = guardianConfiguration.getMandatoryStringProperty("business_data.url")
  }

  object weather {
    lazy val apiKey = guardianConfiguration.getStringProperty("weather.api.key")
  }

  object indexes {
    lazy val tagIndexesBucket =
      guardianConfiguration.getMandatoryStringProperty("tag_indexes.bucket")

    lazy val adminRebuildIndexRateInMinutes =
      guardianConfiguration.getIntegerProperty("tag_indexes.rebuild_rate_in_minutes").getOrElse(60)
  }

  object environment {
    import InstallVars._

    lazy val stage = InstallationVars.stage
    lazy val projectName = playConfiguration.getString("guardian.projectName").getOrElse("frontend")
    lazy val secure = playConfiguration.getBoolean("guardian.secure").getOrElse(false)

    lazy val isProd = stage.equalsIgnoreCase("prod")
    lazy val isCode = stage.equalsIgnoreCase("code")
    lazy val isNonProd = List("dev", "code", "gudev").contains(stage.toLowerCase)

    lazy val isPreview = projectName == "preview"
  }

  object switches {
    lazy val key = guardianConfiguration.getMandatoryStringProperty("switches.key")
  }

  object healthcheck {
    lazy val properties = guardianConfiguration.getPropertyNames filter {
      _ matches """healthcheck\..*\.url"""
    }

    lazy val urls = properties map { property =>
      guardianConfiguration.getStringProperty(property).get
    }
    lazy val updateIntervalInSecs: Int = guardianConfiguration.getIntegerProperty("healthcheck.updateIntervalInSecs").getOrElse(5)
  }

  object debug {
    lazy val enabled: Boolean = guardianConfiguration.getStringProperty("debug.enabled").forall(_.toBoolean)
    lazy val beaconUrl: String = guardianConfiguration.getStringProperty("beacon.url").getOrElse("")
  }

  override def toString = guardianConfiguration.toString

  case class Auth(user: String, password: String)

  object contentApi {
    val contentApiHost: String = guardianConfiguration.getMandatoryStringProperty("content.api.host")

    def contentApiDraftHost: String =
        guardianConfiguration.getStringProperty("content.api.draft.host")
          .filter(_ => Switches.FaciaToolDraftContent.isSwitchedOn)
          .getOrElse(contentApiHost)

    val previewHost: String = guardianConfiguration.getStringProperty("content.api.preview.host").getOrElse(contentApiHost)

    lazy val key: Option[String] = guardianConfiguration.getStringProperty("content.api.key")
    lazy val timeout: Int = guardianConfiguration.getIntegerProperty("content.api.timeout.millis").getOrElse(2000)

    lazy val circuitBreakerErrorThreshold =
      guardianConfiguration.getIntegerProperty("content.api.circuit_breaker.max_failures").getOrElse(5)

    lazy val circuitBreakerResetTimeout =
      guardianConfiguration.getIntegerProperty("content.api.circuit_breaker.reset_timeout").getOrElse(20000)

    lazy val previewAuth: Option[Auth] = for {
      user <- guardianConfiguration.getStringProperty("content.api.preview.user")
      password <- guardianConfiguration.getStringProperty("content.api.preview.password")
    } yield Auth(user, password)
  }

  object ophanApi {
    lazy val key = guardianConfiguration.getStringProperty("ophan.api.key")
    lazy val host = guardianConfiguration.getStringProperty("ophan.api.host")
  }

  object ophan {
    lazy val jsLocation = guardianConfiguration.getStringProperty("ophan.js.location").getOrElse("//j.ophan.co.uk/ophan.ng")
    lazy val embedJsLocation = guardianConfiguration.getStringProperty("ophan.embed.js.location").getOrElse("//j.ophan.co.uk/ophan.embed")
  }

  object omniture {
    lazy val account = guardianConfiguration.getStringProperty("guardian.page.omnitureAccount").getOrElse("guardiangu-network")
    lazy val ampAccount = guardianConfiguration.getStringProperty("guardian.page.omnitureAmpAccount").getOrElse("guardiangudev-code")
    lazy val thirdPartyAppsAccount = guardianConfiguration.getStringProperty("guardian.page.thirdPartyAppsAccount").getOrElse("guardiangu-thirdpartyapps")
  }

  object googletag {
    lazy val jsLocation = guardianConfiguration.getStringProperty("googletag.js.location").getOrElse("//www.googletagservices.com/tag/js/gpt.js")
  }

  object sonobi {
    lazy val jsLocation = guardianConfiguration.getStringProperty("sonobi.js.location").getOrElse("//api.nextgen.guardianapps.co.uk/morpheus.theguardian.12911.js")
  }

  object frontend {
    lazy val store = guardianConfiguration.getMandatoryStringProperty("frontend.store")
    lazy val webEngineersEmail = guardianConfiguration.getStringProperty("email.web.engineers")
  }

  object site {
    lazy val host = guardianConfiguration.getStringProperty("guardian.page.host").getOrElse("")
  }

  object cookies {
    lazy val lastSeenKey: String = "lastseen"
    lazy val sessionExpiryTime = guardianConfiguration.getIntegerProperty("auth.timeout").getOrElse(60000)
  }

  object db {
    lazy val sentry_db_driver = guardianConfiguration.getStringProperty("db.sentry.driver").getOrElse("")
    lazy val sentry_db_url = guardianConfiguration.getStringProperty("db.sentry.url").getOrElse("")
    lazy val sentry_db_username = guardianConfiguration.getStringProperty("db.sentry.user").getOrElse("")
    lazy val sentry_db_password = guardianConfiguration.getStringProperty("db.sentry.password").getOrElse("")
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
    lazy val token = guardianConfiguration.getStringProperty("github.token")
  }

  object teamcity {
    lazy val host = guardianConfiguration.getMandatoryStringProperty("teamcity.host")
    lazy val internalHost = guardianConfiguration.getMandatoryStringProperty("teamcity.internalhost")
  }

  object ajax {
    lazy val url = guardianConfiguration.getStringProperty("ajax.url").getOrElse("")
    lazy val nonSecureUrl =
      guardianConfiguration.getStringProperty("ajax.url").getOrElse("")
    lazy val corsOrigins: Seq[String] = guardianConfiguration.getStringProperty("ajax.cors.origin").map(_.split(",")
      .map(_.trim).toSeq).getOrElse(Nil)
  }

  object amp {
    private lazy val scheme = guardianConfiguration.getStringProperty("amp.scheme").getOrElse("")
    lazy val host = guardianConfiguration.getStringProperty("amp.host").getOrElse("")
    lazy val baseUrl = scheme + host
  }

  object id {
    lazy val url = guardianConfiguration.getStringProperty("id.url").getOrElse("")
    lazy val apiRoot = guardianConfiguration.getStringProperty("id.apiRoot").getOrElse("")
    lazy val domain = """^https?://(?:profile\.)?([^/:]+)""".r.unapplySeq(url).flatMap(_.headOption).getOrElse("theguardian.com")
    lazy val apiClientToken = guardianConfiguration.getStringProperty("id.apiClientToken").getOrElse("")
    lazy val oauthUrl = guardianConfiguration.getStringProperty("id.oauth.url").getOrElse("")
    lazy val membershipUrl = guardianConfiguration.getStringProperty("id.membership.url").getOrElse("https://membership.theguardian.com")
    lazy val digitalPackUrl = guardianConfiguration.getStringProperty("id.digitalpack.url").getOrElse("https://subscribe.theguardian.com")
    lazy val membersDataApiUrl = guardianConfiguration.getStringProperty("id.members-data-api.url").getOrElse("https://members-data-api.theguardian.com")
    lazy val stripePublicToken =  guardianConfiguration.getStringProperty("id.membership.stripePublicToken").getOrElse("")
  }

  object static {
    lazy val path =
      if (environment.secure) guardianConfiguration.getMandatoryStringProperty("static.securePath")
      else guardianConfiguration.getMandatoryStringProperty("static.path")
  }

  object images {
    lazy val path = guardianConfiguration.getMandatoryStringProperty("images.path")
    val fallbackLogo = Static("images/fallback-logo.png")
    object backends {
      lazy val mediaToken: String = guardianConfiguration.getMandatoryStringProperty("images.media.token")
      lazy val staticToken: String = guardianConfiguration.getMandatoryStringProperty("images.static.token")
      lazy val uploadsToken: String = guardianConfiguration.getMandatoryStringProperty("images.uploads.token")
    }
  }

  object headlines {
    lazy val spreadsheet = guardianConfiguration.getMandatoryStringProperty("headlines.spreadsheet")
  }

  object assets {
    lazy val path = guardianConfiguration.getMandatoryStringProperty("assets.path")

    // This guardianConfiguration value determines if this server will load and resolve assets using the asset map.
    // Set this to true if you want to run the Play server in dev, and emulate prod mode asset-loading.
    // If true in dev, assets are locally loaded from the `hash` build output, otherwise assets come from 'target' for css, and 'src' for js.
    lazy val useHashedBundles =  guardianConfiguration.getStringProperty("assets.useHashedBundles")
      .map(_.toBoolean)
      .getOrElse(environment.isProd || environment.isCode)
  }

  object staticSport {
    lazy val path = guardianConfiguration.getMandatoryStringProperty("staticSport.path")
  }

  object sport {
    lazy val apiUrl = guardianConfiguration.getStringProperty("sport.apiUrl").getOrElse(ajax.nonSecureUrl)
  }

  object oas {
    lazy val siteIdHost = guardianConfiguration.getStringProperty("oas.siteId.host").getOrElse(".guardian.co.uk")
    lazy val url = guardianConfiguration.getStringProperty("oas.url").getOrElse("http://oas.theguardian.com/RealMedia/ads/")
  }

  object facebook {
    lazy val appId = guardianConfiguration.getMandatoryStringProperty("guardian.page.fbAppId")
  }

  object ios {
    lazy val ukAppId = "409128287"
    lazy val usAppId = "411493119"
  }

  object discussion {
    lazy val apiRoot = guardianConfiguration.getMandatoryStringProperty("guardian.page.discussionApiUrl")
    lazy val apiTimeout = guardianConfiguration.getMandatoryStringProperty("discussion.apiTimeout")
    lazy val apiClientHeader = guardianConfiguration.getMandatoryStringProperty("discussion.apiClientHeader")
    lazy val d2Uid = guardianConfiguration.getMandatoryStringProperty("discussion.d2Uid")
    lazy val frontendAssetsMap = guardianConfiguration.getStringProperty("discussion.frontend.assetsMap")
    lazy val frontendAssetsMapRefreshInterval = 5.seconds
    lazy val frontendAssetsVersion = "v1.5.0"
  }

  object witness {
    lazy val witnessApiRoot = guardianConfiguration.getMandatoryStringProperty("witness.apiRoot")
  }

  object commercial {

    lazy val testDomain =
      if (environment.isProd) "http://m.code.dev-theguardian.com"
      else guardianConfiguration.getStringProperty("guardian.page.host") getOrElse ""

    lazy val dfpAdUnitGuRoot = guardianConfiguration.getMandatoryStringProperty("guardian.page.dfpAdUnitRoot")
    lazy val dfpFacebookIaAdUnitRoot = guardianConfiguration.getMandatoryStringProperty("guardian.page.dfp.facebookIaAdUnitRoot")
    lazy val dfpMobileAppsAdUnitRoot = guardianConfiguration.getMandatoryStringProperty("guardian.page.dfp.mobileAppsAdUnitRoot")
    lazy val dfpAccountId = guardianConfiguration.getMandatoryStringProperty("guardian.page.dfpAccountId")

    lazy val books_url = guardianConfiguration.getMandatoryStringProperty("commercial.books_url")
    lazy val masterclasses_url =
      guardianConfiguration.getMandatoryStringProperty("commercial.masterclasses_url")
    lazy val soulmates_url = guardianConfiguration.getMandatoryStringProperty("commercial.soulmates_url")
    lazy val soulmatesApiUrl = guardianConfiguration.getStringProperty("soulmates.api.url")
    lazy val travelFeedUrl = guardianConfiguration.getStringProperty("travel.feed.url")
    lazy val guMerchandisingAdvertiserId =
      guardianConfiguration.getMandatoryStringProperty("commercial.dfp.guMerchandising.advertiserId")

    // root dir relative to S3 bucket
    private lazy val commercialRoot = {
      guardianConfiguration.getStringProperty("commercial.s3.root") getOrElse s"${environment.stage.toUpperCase}/commercial"
    }

    private lazy val dfpRoot = s"$commercialRoot/dfp"
    lazy val dfpInlineMerchandisingTagsDataKey = s"$dfpRoot/inline-merchandising-tags-v3.json"
    lazy val dfpHighMerchandisingTagsDataKey = s"$dfpRoot/high-merchandising-tags.json"
    lazy val dfpPageSkinnedAdUnitsKey = s"$dfpRoot/pageskinned-adunits-v6.json"
    lazy val dfpLineItemsKey = s"$dfpRoot/lineitems-v5.json"
    lazy val dfpActiveAdUnitListKey = s"$dfpRoot/active-ad-units.csv"
    lazy val dfpMobileAppsAdUnitListKey = s"$dfpRoot/mobile-active-ad-units.csv"
    lazy val dfpFacebookIaAdUnitListKey = s"$dfpRoot/facebookia-active-ad-units.csv"
    lazy val dfpTemplateCreativesKey = s"$dfpRoot/template-creatives.json"
    lazy val dfpCustomTargetingKey = s"$dfpRoot/custom-targeting-key-values.json"
    lazy val topAboveNavSlotTakeoversKey = s"$dfpRoot/top-above-nav-slot-takeovers-v2.json"

    lazy val takeoversWithEmptyMPUsKey = s"$commercialRoot/takeovers-with-empty-mpus.json"

    private lazy val merchandisingFeedsRoot = s"$commercialRoot/merchandising"
    lazy val merchandisingFeedsLatest = s"$merchandisingFeedsRoot/latest"

    lazy val masterclassesToken = guardianConfiguration.getStringProperty("masterclasses.token")
    lazy val liveEventsToken = guardianConfiguration.getStringProperty("live-events.token")
    lazy val liveEventsMembershipUrl = "https://membership.theguardian.com/events.json"
    lazy val jobsUrl= guardianConfiguration.getStringProperty("jobs.api.url")

    object magento {
      lazy val domain = guardianConfiguration.getStringProperty("magento.domain")
      lazy val consumerKey = guardianConfiguration.getStringProperty("magento.consumer.key")
      lazy val consumerSecret = guardianConfiguration.getStringProperty("magento.consumer.secret")
      lazy val accessToken = guardianConfiguration.getStringProperty("magento.access.token.key")
      lazy val accessTokenSecret = guardianConfiguration.getStringProperty("magento.access.token.secret")
      lazy val authorizationPath = guardianConfiguration.getStringProperty("magento.auth.path")
      lazy val isbnLookupPath = guardianConfiguration.getStringProperty("magento.isbn.lookup.path")
    }

    lazy val adOpsTeam = guardianConfiguration.getStringProperty("email.adOpsTeam")
    lazy val adOpsAuTeam = guardianConfiguration.getStringProperty("email.adOpsTeamAu")
    lazy val adOpsUsTeam = guardianConfiguration.getStringProperty("email.adOpsTeamUs")
    lazy val adTechTeam = guardianConfiguration.getStringProperty("email.adTechTeam")
    lazy val gLabsTeam = guardianConfiguration.getStringProperty("email.gLabsTeam")

    lazy val expiredAdFeatureUrl = s"${site.host}/info/2015/feb/06/paid-content-removal-policy"
  }

  object open {
    lazy val ctaApiRoot = guardianConfiguration.getMandatoryStringProperty("open.cta.apiRoot")
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
      ("stripePublicToken", id.stripePublicToken),
      ("sonobiHeaderBiddingJsUrl", sonobi.jsLocation)
    )

    lazy val pageData: Map[String, String] = {
      val keys = guardianConfiguration.getPropertyNames.filter(_.startsWith("guardian.page."))
      keys.foldLeft(Map.empty[String, String]) {
        case (map, key) => map + (key -> guardianConfiguration.getMandatoryStringProperty(key))
      }
    }
  }

  object front {
    lazy val config = guardianConfiguration.getMandatoryStringProperty("front.config")
  }

  object targeting {
    lazy val campaignsUrl = guardianConfiguration.getStringProperty("targeting.campaignsUrl")
  }

  object facia {
    lazy val stage = guardianConfiguration.getStringProperty("facia.stage").getOrElse(environment.stage)
    lazy val collectionCap: Int = 35
  }

  object faciatool {
    lazy val crossAccountSourceBucket = guardianConfiguration.getMandatoryStringProperty("aws.cmsFronts.frontCollections.bucket")
    lazy val outputBucket = guardianConfiguration.getMandatoryStringProperty("aws.bucket")

    lazy val frontPressCronQueue = guardianConfiguration.getStringProperty("frontpress.sqs.cron_queue_url")
    lazy val frontPressToolQueue = guardianConfiguration.getStringProperty("frontpress.sqs.tool_queue_url")
    lazy val frontPressStatusNotificationStream = guardianConfiguration.getStringProperty("frontpress.kinesis.status_notification_stream")

    lazy val configBeforePressTimeout: Int = 1000

    val showTestContainers =
      guardianConfiguration.getStringProperty("faciatool.show_test_containers").contains("true")

    lazy val adminPressJobStandardPushRateInMinutes: Int =
      Try(guardianConfiguration.getStringProperty("admin.pressjob.standard.push.rate.inminutes").get.toInt)
        .getOrElse(5)

    lazy val adminPressJobHighPushRateInMinutes: Int =
      Try(guardianConfiguration.getStringProperty("admin.pressjob.high.push.rate.inminutes").get.toInt)
        .getOrElse(1)

    lazy val adminPressJobLowPushRateInMinutes: Int =
      Try(guardianConfiguration.getStringProperty("admin.pressjob.low.push.rate.inminutes").get.toInt)
        .getOrElse(60)

    lazy val stsRoleToAssume = guardianConfiguration.getStringProperty("aws.cmsFronts.account.role")

    def crossAccountMandatoryCredentials: AWSCredentialsProvider =
      crossAccountCredentials.getOrElse(throw new BadConfigurationException("AWS credentials for cross account are not configured"))

    lazy val crossAccountCredentials: Option[AWSCredentialsProvider] = faciatool.stsRoleToAssume.flatMap { role =>
      val provider = new AWSCredentialsProviderChain(
        new ProfileCredentialsProvider("cmsFronts"),
        new STSAssumeRoleSessionCredentialsProvider(role, "frontend")
      )

      // this is a bit of a convoluted way to check whether we actually have credentials.
      // I guess in an ideal world there would be some sort of isConfigued() method...
      try {
        val creds = provider.getCredentials
        Some(provider)
      } catch {
        case ex: AmazonClientException =>
          log.error("amazon client cross account exception", ex)

          // We really, really want to ensure that PROD is configured before saying a box is OK
          if (playEnvironment.mode == Prod) throw ex
          // this means that on dev machines you only need to configure keys if you are actually going to use them
          None
      }
    }
  }

  object r2Press {
    lazy val sqsQueueUrl = guardianConfiguration.getStringProperty("admin.r2.page.press.sqs.queue.url")
    lazy val sqsTakedownQueueUrl = guardianConfiguration.getStringProperty("admin.r2.page.press.takedown.sqs.queue.url")
    lazy val pressRateInSeconds = guardianConfiguration.getIntegerProperty("admin.r2.page.press.rate.seconds").getOrElse(60)
    lazy val pressQueueWaitTimeInSeconds = guardianConfiguration.getIntegerProperty("admin.r2.press.queue.wait.seconds").getOrElse(10)
    lazy val pressQueueMaxMessages = guardianConfiguration.getIntegerProperty("admin.r2.press.queue.max.messages").getOrElse(10)
    lazy val fallbackCachebustId = guardianConfiguration.getStringProperty("admin.r2.press.fallback.cachebust.id").getOrElse("")
  }

  object memcached {
    lazy val host = guardianConfiguration.getStringProperty("memcached.host")
  }

  object redis {
    lazy val endpoint = guardianConfiguration.getStringProperty("redis.host")
  }

  object aws {

    lazy val region = guardianConfiguration.getMandatoryStringProperty("aws.region")
    lazy val bucket = guardianConfiguration.getMandatoryStringProperty("aws.bucket")
    lazy val notificationSns: String = guardianConfiguration.getMandatoryStringProperty("sns.notification.topic.arn")
    lazy val videoEncodingsSns: String = guardianConfiguration.getMandatoryStringProperty("sns.missing_video_encodings.topic.arn")
    lazy val frontPressSns: Option[String] = guardianConfiguration.getStringProperty("frontpress.sns.topic")
    lazy val r2PressSns: Option[String] = guardianConfiguration.getStringProperty("r2press.sns.topic")
    lazy val r2PressTakedownSns: Option[String] = guardianConfiguration.getStringProperty("r2press.takedown.sns.topic")

    def mandatoryCredentials: AWSCredentialsProvider = credentials.getOrElse(throw new BadConfigurationException("AWS credentials are not configured"))
    val credentials: Option[AWSCredentialsProvider] = {
      val provider = new AWSCredentialsProviderChain(
        new ProfileCredentialsProvider("frontend"),
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
          if (playEnvironment.mode == Prod) throw ex
          // this means that on dev machines you only need to configure keys if you are actually going to use them
          None
      }
    }
  }

  object riffraff {
    lazy val url = guardianConfiguration.getMandatoryStringProperty("riffraff.url")
    lazy val apiKey = guardianConfiguration.getMandatoryStringProperty("riffraff.apikey")
  }

  object formstack {
    lazy val url = guardianConfiguration.getMandatoryStringProperty("formstack.url")
    lazy val oAuthToken = guardianConfiguration.getMandatoryStringProperty("formstack.oauthToken")
  }

  object standalone {
    lazy val oauthCredentials: Option[OAuthCredentials] = for {
      oauthClientId <- guardianConfiguration.getStringProperty("standalone.oauth.clientid")
      // TODO needs the orElse fallback till we roll out new properties files
      oauthSecret <- guardianConfiguration.getStringProperty("standalone.oauth.secret").orElse(guardianConfiguration.getStringProperty("preview.oauth.secret"))
      oauthCallback <- guardianConfiguration.getStringProperty("standalone.oauth.callback")
    } yield OAuthCredentials(oauthClientId, oauthSecret, oauthCallback)
  }

  object pngResizer {
    val cacheTimeInSeconds = guardianConfiguration.getIntegerProperty("png_resizer.image_cache_time").getOrElse(86400)
    val ttlInSeconds = guardianConfiguration.getIntegerProperty("png_resizer.image_ttl").getOrElse(86400)
  }


  object emailSignup {
    val url = guardianConfiguration.getMandatoryStringProperty("email.signup.url")
  }

  object NewsAlert {
    lazy val apiKey = guardianConfiguration.getStringProperty("news-alert.api.key")
  }

  object Notifications {
    lazy val latestMessageUrl = guardianConfiguration.getMandatoryStringProperty("notifications.latest_message.url")
    lazy val notificationSubscriptionTable = guardianConfiguration.getMandatoryStringProperty("notifications.subscriptions_table")
  }

  object DeploysNotify {
    lazy val apiKey = guardianConfiguration.getStringProperty("deploys-notify.api.key")
  }

  object Logstash {
    lazy val enabled = guardianConfiguration.getStringProperty("logstash.enabled").exists(_.toBoolean)
    lazy val stream = guardianConfiguration.getStringProperty("logstash.stream.name")
    lazy val streamRegion = guardianConfiguration.getStringProperty("logstash.stream.region")
  }

  object Elk {
    lazy val kibanaUrl = guardianConfiguration.getStringProperty("elk.kibana.url")
    lazy val elasticsearchHeadUrl = guardianConfiguration.getStringProperty("elk.elasticsearchHead.url")
  }

  object Survey {
    lazy val formStackAccountName: String = "guardiannewsampampmedia"
  }

  object Media {
    lazy val externalEmbedHost = guardianConfiguration.getMandatoryStringProperty("guardian.page.externalEmbedHost")
  }

}

object ManifestData {
  lazy val build = ManifestFile.asKeyValuePairs.getOrElse("Build", "DEV").dequote.trim
  lazy val revision = ManifestFile.asKeyValuePairs.getOrElse("Revision", "DEV").dequote.trim
}
