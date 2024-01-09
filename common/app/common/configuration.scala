package common

import java.io.{File, FileInputStream}
import java.nio.charset.Charset
import java.util.Map.Entry

import com.amazonaws.AmazonClientException
import com.amazonaws.auth._
import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.typesafe.config.{ConfigException, ConfigFactory}
import common.Environment.{app, awsRegion, stage}
import conf.{Configuration, Static}
import org.apache.commons.io.IOUtils
import services.ParameterStore

import scala.jdk.CollectionConverters._
import scala.concurrent.duration._
import scala.util.{Failure, Success, Try}

class BadConfigurationException(msg: String) extends RuntimeException(msg)

object Environment extends GuLogging {

  private[this] val installVars = {
    val source = new File("/etc/gu/install_vars") match {
      case f if f.exists => IOUtils.toString(new FileInputStream(f), Charset.defaultCharset())
      case _             => ""
    }

    Properties(source)
  }

  // Prefer env vars over install vars over default
  private[this] def get(name: String, default: String): String = {
    sys.env.get(name.toUpperCase).orElse(installVars.get(name)).getOrElse(default)
  }

  val stack: String = get("stack", "frontend")
  val app: String = get("app", "dev-build")
  val stage: String = get("STAGE", "DEV")
  val awsRegion: String = get("region", "eu-west-1")
  val configBucket: String = get("configBucket", "aws-frontend-store")

  log.info(
    s"Environment loaded as: stack=$stack, app=$app, stage=$stage, awsRegion=$awsRegion, configBucket=$configBucket",
  )
}

/**
  * Main configuration
  *
  * Loaded remotely, but local overrides possible in an `/etc/gu/frontend.conf`
  * or `~/.gu/frontend.conf` file under a `devOverrides` key. E.g:
  *
  *   devOverrides {
  *     switches.key=DEV/config/switches-yournamehere.properties
  *     facia.stage=CODE
  *   }
  */
object GuardianConfiguration extends GuLogging {

  import com.typesafe.config.Config

  def unwrapQuotedString(input: String): String = {
    val quotedString = "\"(.*)\"".r
    input match {
      case quotedString(content) => content
      case content               => content
    }
  }

  private def configFromFile(path: String, configPath: String): Config = {
    val fileConfig = ConfigFactory.parseFileAnySyntax(new File(path))
    Try(fileConfig.getConfig(configPath)).getOrElse(ConfigFactory.empty)
  }

  private def configFromParameterStore(path: String): Config = {
    val params = parameterStore.getPath(path)
    val configMap = params.map {
      case (key, value) => key.replaceFirst(s"$path/", "") -> value
    }
    ConfigFactory.parseMap(configMap.asJava)
  }

  private lazy val parameterStore = new ParameterStore(awsRegion)

  lazy val configuration: Config = {
    if (stage == "DEVINFRA")
      ConfigFactory.parseResourcesAnySyntax("env/DEVINFRA.properties")
    else {
      val userPrivate = configFromFile(s"${System.getProperty("user.home")}/.gu/frontend.conf", "devOverrides")
      val runtimeOnly = configFromFile("/etc/gu/frontend.conf", "parameters")
      val frontendConfig = configFromParameterStore("/frontend")
      val frontendStageConfig = configFromParameterStore(s"/frontend/${stage.toLowerCase}")
      val frontendAppConfig = configFromParameterStore(s"/frontend/${stage.toLowerCase}/${app.toLowerCase}")

      userPrivate
        .withFallback(runtimeOnly)
        .withFallback(frontendAppConfig)
        .withFallback(frontendStageConfig)
        .withFallback(frontendConfig)
    }
  }

  implicit class ScalaConvertProperties(conf: Config) {

    def getStringProperty: (String) => Option[String] = getProperty(conf.getString) _
    def getMandatoryStringProperty: (String) => String = getMandatoryProperty(conf.getString) _
    def getIntegerProperty: (String) => Option[Int] = getProperty(conf.getInt) _

    def getPropertyNames: Seq[String] = conf.entrySet.asScala.toSet.map((_.getKey): Entry[String, _] => String).toSeq
    def getStringPropertiesSplitByComma(propertyName: String): List[String] = {
      getStringProperty(propertyName) match {
        case Some(property) => (property split ",").toList
        case None           => Nil
      }
    }

    def getMandatoryProperty[T](get: String => T)(property: String): T =
      getProperty(get)(property)
        .getOrElse(throw new BadConfigurationException(s"$property not configured for $stage"))

    def getProperty[T](get: String => T)(property: String): Option[T] =
      Try(get(property)) match {
        case Success(value)                      => Some(value)
        case Failure(_: ConfigException.Missing) => None
        case Failure(e) =>
          log.error(s"couldn't retrieve $property", e)
          None
      }

  }

}

class GuardianConfiguration extends GuLogging {
  import GuardianConfiguration._

  case class OAuthCredentials(oauthClientId: String, oauthSecret: String, oauthCallback: String)
  case class OAuthCredentialsWithMultipleCallbacks(
      oauthClientId: String,
      oauthSecret: String,
      authorizedOauthCallbacks: List[String],
  )

  object business {
    lazy val stocksEndpoint: String =
      configuration.getMandatoryStringProperty("business_data.url") // Decommissioned, see marker: 7dde429f00b1
  }

  object rendering {
    lazy val baseURL: String = configuration.getMandatoryStringProperty("rendering.baseURL")
    lazy val sentryHost: String = configuration.getMandatoryStringProperty("rendering.sentryHost")
    lazy val sentryPublicApiKey: String = configuration.getMandatoryStringProperty("rendering.sentryPublicApiKey")
    lazy val timeout: FiniteDuration = 2.seconds
    lazy val circuitBreakerMaxFailures = 10 // we should increase this as DCR sees increasing usage
  }

  object contributionsService {
    lazy val url: String = configuration.getMandatoryStringProperty("contributionsService.url")
  }

  object weather {
    lazy val apiKey: Option[String] = configuration.getStringProperty("weather.api.key")
  }

  object indexes {
    lazy val tagIndexesBucket: String =
      configuration.getMandatoryStringProperty("tag_indexes.bucket")

    // This shouldn't be > 60 as it's in the context of `0/$adminRebuildIndexRateInMinutes` and `0/60` is invalid
    // see: https://support.hcltechsw.com/csm?id=kb_article&sysparm_article=KB0091722
    lazy val adminRebuildIndexRateInMinutes: Int =
      configuration.getIntegerProperty("tag_indexes.rebuild_rate_in_minutes").getOrElse(59)
  }

  object environment {
    lazy val stage = Environment.stage
    lazy val app = Environment.app

    lazy val isProd: Boolean = stage.equalsIgnoreCase("prod")
    lazy val isCode: Boolean = stage.equalsIgnoreCase("code")
    lazy val isDev: Boolean = stage.equalsIgnoreCase("dev")
    lazy val isDevInfra: Boolean = stage.equalsIgnoreCase("devinfra")
    lazy val isNonProd: Boolean = List("dev", "code", "gudev").contains(stage.toLowerCase)
    lazy val isNonDev: Boolean = isProd || isCode || isDevInfra
  }

  object switches {
    lazy val key: String = configuration.getMandatoryStringProperty("switches.key")
  }

  object healthcheck {
    lazy val updateIntervalInSecs: Int =
      configuration.getIntegerProperty("healthcheck.updateIntervalInSecs").getOrElse(5)
  }

  object debug {
    lazy val enabled: Boolean = configuration.getStringProperty("debug.enabled").forall(_.toBoolean)
    lazy val beaconUrl: String = configuration.getStringProperty("beacon.url").getOrElse("")
  }

  override def toString: String = configuration.toString

  case class Auth(user: String, password: String)

  object contentApi {
    val contentApiHost: String = configuration.getMandatoryStringProperty("content.api.host")

    val previewHost: Option[String] = configuration.getStringProperty("content.api.preview.iam.host")

    lazy val key: Option[String] = configuration.getStringProperty("content.api.key")
    lazy val timeout: FiniteDuration =
      Duration.create(
        configuration
          .getIntegerProperty("content.api.timeout.millis")
          .getOrElse(2000L)
          .asInstanceOf[Number]
          .longValue(),
        MILLISECONDS,
      )

    lazy val circuitBreakerErrorThreshold: Int =
      configuration.getIntegerProperty("content.api.circuit_breaker.max_failures").getOrElse(30)
    lazy val circuitBreakerResetTimeout: FiniteDuration =
      FiniteDuration(
        configuration
          .getIntegerProperty("content.api.circuit_breaker.reset_timeout")
          .getOrElse(2000L)
          .asInstanceOf[Number]
          .longValue(),
        MILLISECONDS,
      )

    //Cross account credentials for capi preview
    lazy val capiPreviewRoleToAssume: Option[String] =
      configuration.getStringProperty("content.api.preview.roleToAssume")

    lazy val capiPreviewCredentials: AWSCredentialsProvider = {
      new AWSCredentialsProviderChain(
        List(
          Some(new ProfileCredentialsProvider("capi")),
          capiPreviewRoleToAssume.map(new STSAssumeRoleSessionCredentialsProvider.Builder(_, "capi").build()),
        ).flatten: _*,
      )
    }

    lazy val nextPreviousPageSize: Int =
      configuration.getIntegerProperty("content.api.nextPreviousPageSize").getOrElse(50)
  }

  object ophanApi {
    lazy val key: Option[String] = configuration.getStringProperty("ophan.api.key")
    lazy val host: Option[String] = configuration.getStringProperty("ophan.api.host")
  }

  object ophan {
    lazy val jsLocation: String =
      configuration.getStringProperty("ophan.js.location").getOrElse("//j.ophan.co.uk/ophan.ng")
    lazy val embedJsLocation: String =
      configuration.getStringProperty("ophan.embed.js.location").getOrElse("//j.ophan.co.uk/ophan.embed")
  }

  object omniture {
    lazy val account: String =
      configuration.getStringProperty("guardian.page.omnitureAccount").getOrElse("guardiangu-network")
    lazy val ampAccount: String =
      configuration.getStringProperty("guardian.page.omnitureAmpAccount").getOrElse("guardiangudev-code")
    lazy val thirdPartyAppsAccount: String =
      configuration.getStringProperty("guardian.page.thirdPartyAppsAccount").getOrElse("guardiangu-thirdpartyapps")
  }

  object googletag {
    lazy val jsLocation: String = configuration
      .getStringProperty("googletag.js.location")
      .getOrElse("//securepubads.g.doubleclick.net/tag/js/gpt.js")
  }

  // Amazon A9 APS Transparent Ad Marketplace library
  object a9ApsTag {
    lazy val key: String = configuration.getStringProperty("apstag.api.key").getOrElse("")
  }

  object google {
    lazy val subscribeWithGoogleApiUrl: String =
      configuration.getStringProperty("google.subscribeWithGoogleApiUrl").getOrElse("https://swg.theguardian.com")
    lazy val googleRecaptchaSiteKey: String =
      configuration.getMandatoryStringProperty("guardian.page.googleRecaptchaSiteKey")
    lazy val googleRecaptchaSecret: String = configuration.getMandatoryStringProperty("google.googleRecaptchaSecret")
  }

  object affiliateLinks {
    lazy val bucket: Option[String] = configuration.getStringProperty("skimlinks.bucket")
    lazy val domainsKey = "skimlinks/skimlinks-domains.csv"
    lazy val skimlinksId: String = configuration.getMandatoryStringProperty("skimlinks.id")
    lazy val affiliateLinkSections: Set[String] =
      configuration.getStringProperty("affiliatelinks.sections").getOrElse("").split(",").toSet
    lazy val defaultOffTags: Set[String] =
      configuration.getStringProperty("affiliatelinks.default.off.tags").getOrElse("").split(",").toSet
    lazy val alwaysOffTags: Set[String] =
      configuration.getStringProperty("affiliatelinks.always.off.tags").getOrElse("").split(",").toSet
  }

  object frontend {
    lazy val store: String = configuration.getMandatoryStringProperty("frontend.store")
    lazy val webEngineersEmail: Option[String] = configuration.getStringProperty("email.web.engineers")
    lazy val dotcomPlatformEmail: Option[String] = configuration.getStringProperty("email.dotcom_platform")
  }

  object site {
    lazy val host: String = configuration.getStringProperty("guardian.page.host").getOrElse("")
  }

  object cookies {
    lazy val lastSeenKey: String = "lastseen"
    lazy val sessionExpiryTime: Int = configuration.getIntegerProperty("auth.timeout").getOrElse(60000)
  }

  object db {
    lazy val sentry_db_driver: String = configuration.getStringProperty("db.sentry.driver").getOrElse("")
    lazy val sentry_db_url: String = configuration.getStringProperty("db.sentry.url").getOrElse("")
    lazy val sentry_db_username: String = configuration.getStringProperty("db.sentry.user").getOrElse("")
    lazy val sentry_db_password: String = configuration.getStringProperty("db.sentry.password").getOrElse("")
  }

  object proxy {
    lazy val isDefined: Boolean = hostOption.isDefined && portOption.isDefined

    private lazy val hostOption = Option(System.getenv("proxy_host"))
    private lazy val portOption = Option(System.getenv("proxy_port")) flatMap { augmentString(_).toIntOption }

    lazy val host: String = hostOption getOrElse {
      throw new IllegalStateException("HTTP proxy host not configured")
    }

    lazy val port: Int = portOption getOrElse {
      throw new IllegalStateException("HTTP proxy port not configured")
    }
  }

  object github {
    lazy val token: Option[String] = configuration.getStringProperty("github.token")
  }

  object ajax {
    lazy val url: String = configuration.getStringProperty("ajax.url").getOrElse("")
    lazy val nonSecureUrl: String =
      configuration.getStringProperty("ajax.url").getOrElse("")
    lazy val corsOrigins: Seq[String] = configuration
      .getStringProperty("ajax.cors.origin")
      .map(
        _.split(",")
          .map(_.trim)
          .toSeq,
      )
      .getOrElse(Nil)
  }

  object amp {
    private lazy val scheme = configuration.getStringProperty("amp.scheme").getOrElse("")
    lazy val host: String = configuration.getStringProperty("amp.host").getOrElse("")
    lazy val baseUrl: String = scheme + host

    lazy val flushPublicKey: String = configuration.getMandatoryStringProperty("google.amp.flush.key.public")
  }

  object dotcom {
    lazy val baseUrl = "https://www.theguardian.com"
  }

  object id {
    lazy val url: String = configuration.getStringProperty("id.url").getOrElse("")
    lazy val apiRoot: String = configuration.getStringProperty("id.apiRoot").getOrElse("")
    lazy val domain: String =
      """^https?://(?:profile\.)?([^/:]+)""".r.unapplySeq(url).flatMap(_.headOption).getOrElse("theguardian.com")
    lazy val apiClientToken: String = configuration.getStringProperty("id.apiClientToken").getOrElse("")
    lazy val oauthUrl: String = configuration.getStringProperty("id.oauth.url").getOrElse("")
    lazy val mmaUrl: String =
      configuration.getStringProperty("id.manage.url").getOrElse("https://manage.theguardian.com")
    lazy val membershipUrl: String =
      configuration.getStringProperty("id.membership.url").getOrElse("https://membership.theguardian.com")
    lazy val supportUrl: String =
      configuration.getStringProperty("id.support.url").getOrElse("https://support.theguardian.com")
    lazy val optimizeEpicUrl: String = configuration
      .getStringProperty("id.support.optimize-epic-url")
      .getOrElse("https://support.theguardian.com/epic/control/index.html")
    lazy val subscribeUrl: String =
      configuration.getStringProperty("id.digitalpack.url").getOrElse("https://subscribe.theguardian.com")
    lazy val contributeUrl: String =
      configuration.getStringProperty("id.contribute.url").getOrElse("https://contribute.theguardian.com")
    lazy val membersDataApiUrl: String =
      configuration.getStringProperty("id.members-data-api.url").getOrElse("https://members-data-api.theguardian.com")
    lazy val stripePublicToken: String =
      configuration.getStringProperty("id.membership.stripePublicToken").getOrElse("")
    lazy val accountDeletionApiKey: String = configuration.getStringProperty("id.accountDeletion.apiKey").getOrElse("")
    lazy val accountDeletionApiRoot: String =
      configuration.getStringProperty("id.accountDeletion.apiRoot").getOrElse("")
  }

  object images {
    lazy val host: String = configuration.getMandatoryStringProperty("fastly-io.host")
    lazy val signatureSalt: String = configuration.getMandatoryStringProperty("images.signature-salt")
    val fallbackLogo: String = Static("images/fallback-logo.png")
  }

  object headlines {
    lazy val spreadsheet: String = configuration.getMandatoryStringProperty("headlines.spreadsheet")
  }

  object assets {
    lazy val path: String = configuration.getMandatoryStringProperty("assets.path")

    // This configuration value determines if this server will load and resolve assets using the asset map.
    // Set this to true if you want to run the Play server in dev, and emulate prod mode asset-loading.
    // If true in dev, assets are locally loaded from the `hash` build output, otherwise assets come from 'target' for css, and 'src' for js.
    lazy val useHashedBundles: Boolean = configuration
      .getStringProperty("assets.useHashedBundles")
      .map(_.toBoolean)
      .getOrElse(environment.isNonDev)

    def fullURL(stage: String): String = {
      if (stage != "DEV") {
        path
      } else {
        s"${Configuration.site.host}${path}"
      }
    }
  }

  object staticSport {
    lazy val path: String = configuration.getMandatoryStringProperty("staticSport.path")
  }

  object sport {
    lazy val apiUrl: String = configuration.getStringProperty("sport.apiUrl").getOrElse(ajax.nonSecureUrl)
  }

  object oas {
    lazy val siteIdHost: String = configuration.getStringProperty("oas.siteId.host").getOrElse(".guardian.co.uk")
  }

  object facebook {
    lazy val appId: String = configuration.getMandatoryStringProperty("guardian.page.fbAppId")
    object pages {
      lazy val authorisedIdsForLinkEdits: List[String] =
        configuration.getStringPropertiesSplitByComma("facebook.pages.authorisedIdsForLinkEdits")
    }
    object graphApi {
      lazy val version: String = configuration.getStringProperty("facebook.graphApi.version").getOrElse("3.2")
      lazy val accessToken: String = configuration.getMandatoryStringProperty("facebook.graphApi.accessToken")
    }
  }

  object ios {
    lazy val ukAppId = "409128287"
    lazy val usAppId = "411493119"
  }

  object discussion {
    lazy val apiRoot: String = configuration.getMandatoryStringProperty("guardian.page.discussionApiUrl")
    lazy val apiTimeout: String = configuration.getMandatoryStringProperty("discussion.apiTimeout")
    lazy val apiClientHeader: String = configuration.getMandatoryStringProperty("discussion.apiClientHeader")
    lazy val d2Uid: String = configuration.getMandatoryStringProperty("discussion.d2Uid")
    lazy val frontendAssetsMap: Option[String] = configuration.getStringProperty("discussion.frontend.assetsMap")
    lazy val frontendAssetsMapRefreshInterval: FiniteDuration = 5.seconds
    lazy val frontendAssetsVersion = "v1.6.0"
  }

  object readerRevenue {
    private lazy val readerRevenueRoot = {
      configuration.getStringProperty(
        "readerRevenue.s3.root",
      ) getOrElse s"${environment.stage.toUpperCase}/reader-revenue"
    }

    lazy val contributionsPath = "/contributions-banner-deploy-log"
    lazy val subscriptionsPath = "/subscriptions-banner-deploy-log"
    lazy val contributionsBannerDeployLogKey: String = s"$readerRevenueRoot$contributionsPath"
    lazy val subscriptionsBannerDeployLogKey: String = s"$readerRevenueRoot$subscriptionsPath"
  }

  object commercial {

    lazy val testDomain: String =
      if (environment.isProd) "https://m.code.dev-theguardian.com"
      else configuration.getStringProperty("guardian.page.host") getOrElse ""

    lazy val dfpAdUnitGuRoot: String = configuration.getMandatoryStringProperty("guardian.page.dfpAdUnitRoot")
    lazy val dfpFacebookIaAdUnitRoot: String =
      configuration.getMandatoryStringProperty("guardian.page.dfp.facebookIaAdUnitRoot")
    lazy val dfpMobileAppsAdUnitRoot: String =
      configuration.getMandatoryStringProperty("guardian.page.dfp.mobileAppsAdUnitRoot")
    lazy val dfpAccountId: String = configuration.getMandatoryStringProperty("guardian.page.dfpAccountId")

    lazy val travelFeedUrl: Option[String] = configuration.getStringProperty("travel.feed.url")

    // root dir relative to S3 bucket
    lazy val commercialRoot: String = {
      configuration.getStringProperty("commercial.s3.root") getOrElse s"${environment.stage.toUpperCase}/commercial"
    }

    private lazy val dfpRoot = s"$commercialRoot/dfp"
    lazy val dfpInlineMerchandisingTagsDataKey: String = s"$dfpRoot/inline-merchandising-tags-v3.json"
    lazy val dfpHighMerchandisingTagsDataKey: String = s"$dfpRoot/high-merchandising-tags.json"
    lazy val dfpPageSkinnedAdUnitsKey: String = s"$dfpRoot/pageskinned-adunits-v9.json"
    lazy val dfpNonRefreshableLineItemIdsKey: String = s"$dfpRoot/non-refreshable-lineitem-ids-v1.json"
    lazy val dfpLineItemsKey: String = s"$dfpRoot/lineitems-v7.json"
    lazy val dfpActiveAdUnitListKey: String = s"$dfpRoot/active-ad-units.csv"
    lazy val dfpMobileAppsAdUnitListKey: String = s"$dfpRoot/mobile-active-ad-units.csv"
    lazy val dfpFacebookIaAdUnitListKey: String = s"$dfpRoot/facebookia-active-ad-units.csv"
    lazy val dfpTemplateCreativesKey: String = s"$dfpRoot/template-creatives.json"
    lazy val dfpCustomTargetingKey: String = s"$dfpRoot/custom-targeting-key-values.json"
    lazy val topAboveNavSlotTakeoversKey: String = s"$dfpRoot/top-above-nav-slot-takeovers-v2.json"
    lazy val adsTextObjectKey: String = s"$commercialRoot/ads.txt"
    lazy val appAdsTextObjectKey: String = s"$commercialRoot/app-ads.txt"
    lazy val takeoversWithEmptyMPUsKey: String = s"$commercialRoot/takeovers-with-empty-mpus.json"

    private lazy val merchandisingFeedsRoot = s"$commercialRoot/merchandising"
    lazy val merchandisingFeedsLatest: String = s"$merchandisingFeedsRoot/latest"

    lazy val jobsUrl: Option[String] = configuration.getStringProperty("jobs.api.url")

    lazy val adOpsTeam: Option[String] = configuration.getStringProperty("email.adOpsTeam")
    lazy val adOpsAuTeam: Option[String] = configuration.getStringProperty("email.adOpsTeamAu")
    lazy val adOpsUsTeam: Option[String] = configuration.getStringProperty("email.adOpsTeamUs")
    lazy val adTechTeam: Option[String] = configuration.getStringProperty("email.adTechTeam")
    lazy val gLabsTeam: Option[String] = configuration.getStringProperty("email.gLabsTeam")

    lazy val expiredPaidContentUrl: String = s"${site.host}/info/2015/feb/06/paid-content-removal-policy"

    lazy val prebidAnalyticsStream: String =
      configuration.getMandatoryStringProperty("commercial.prebid.analytics.stream")

    lazy val prebidServerUrl: String =
      configuration.getStringProperty("commercial.prebid.server.url") getOrElse "http://localhost:8000"

    lazy val overrideCommercialBundleUrl: Option[String] =
      if (environment.isDev) configuration.getStringProperty("commercial.overrideCommercialBundleUrl")
      else None
  }

  object journalism {
    lazy val calloutsUrl: String = configuration.getMandatoryStringProperty("journalism.callouts.url")
  }

  object interactive {
    lazy val cdnPath = "https://interactive.guim.co.uk"
    lazy val url: String = s"$cdnPath/next-gen/"
  }

  object javascript {
    // This is config that is available to both Javascript and Scala
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
      ("optimizeEpicUrl", id.optimizeEpicUrl),
      ("a9PublisherId", a9ApsTag.key),
    )

    lazy val pageData: Map[String, String] = {
      val keys = configuration.getPropertyNames.filter(_.startsWith("guardian.page."))
      keys.foldLeft(Map.empty[String, String]) {
        case (map, key) => map + (key -> configuration.getMandatoryStringProperty(key))
      }
    }
  }

  object front {
    lazy val config: String = configuration.getMandatoryStringProperty("front.config")
  }

  object targeting {
    lazy val campaignsUrl: Option[String] = configuration.getStringProperty("targeting.campaignsUrl")
  }

  object facia {
    lazy val stage: String = configuration.getStringProperty("facia.stage").getOrElse(environment.stage)
    lazy val collectionCap: Int = 20
  }

  object faciatool {
    lazy val crossAccountSourceBucket: String =
      configuration.getMandatoryStringProperty("aws.cmsFronts.frontCollections.bucket")
    lazy val outputBucket: String = configuration.getMandatoryStringProperty("aws.bucket")

    lazy val frontPressCronQueue: Option[String] = configuration.getStringProperty("frontpress.sqs.cron_queue_url")
    lazy val frontPressToolQueue: Option[String] = configuration.getStringProperty("frontpress.sqs.tool_queue_url")
    lazy val frontPressStatusNotificationStream: Option[String] =
      configuration.getStringProperty("frontpress.kinesis.status_notification_stream")

    lazy val configBeforePressTimeout: Int = 1000

    val showTestContainers: Boolean =
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

    lazy val stsRoleToAssume: Option[String] = configuration.getStringProperty("aws.cmsFronts.account.role")

    def crossAccountMandatoryCredentials: AWSCredentialsProvider =
      crossAccountCredentials.getOrElse(
        throw new BadConfigurationException("AWS credentials for cross account are not configured"),
      )

    lazy val crossAccountCredentials: Option[AWSCredentialsProvider] = faciatool.stsRoleToAssume.flatMap { role =>
      val provider = new AWSCredentialsProviderChain(
        new ProfileCredentialsProvider("cmsFronts"),
        new STSAssumeRoleSessionCredentialsProvider.Builder(role, "frontend").build(),
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
    lazy val sqsQueueUrl: Option[String] = configuration.getStringProperty("admin.r2.page.press.sqs.queue.url")
    lazy val sqsTakedownQueueUrl: Option[String] =
      configuration.getStringProperty("admin.r2.page.press.takedown.sqs.queue.url")
    lazy val pressRateInSeconds: Int =
      configuration.getIntegerProperty("admin.r2.page.press.rate.seconds").getOrElse(60)
    lazy val pressQueueWaitTimeInSeconds: Int =
      configuration.getIntegerProperty("admin.r2.press.queue.wait.seconds").getOrElse(10)
    lazy val pressQueueMaxMessages: Int =
      configuration.getIntegerProperty("admin.r2.press.queue.max.messages").getOrElse(10)
    lazy val fallbackCachebustId: String =
      configuration.getStringProperty("admin.r2.press.fallback.cachebust.id").getOrElse("")
  }

  object redis {
    lazy val endpoint: Option[String] = configuration.getStringProperty("redis.host")
  }

  object aws {

    lazy val region: String = configuration.getMandatoryStringProperty("aws.region")
    lazy val frontendStoreBucket: String = configuration.getMandatoryStringProperty("aws.bucket")
    lazy val topMentionsStoreBucket: Option[String] =
      configuration.getStringProperty("aws.topMentions.bucket")
    lazy val messageUsStoreBucket: Option[String] =
      configuration.getStringProperty("aws.messageUs.bucket")
    lazy val notificationSns: String = configuration.getMandatoryStringProperty("sns.notification.topic.arn")
    lazy val videoEncodingsSns: String =
      configuration.getMandatoryStringProperty("sns.missing_video_encodings.topic.arn")
    lazy val frontPressSns: Option[String] = configuration.getStringProperty("frontpress.sns.topic")
    lazy val r2PressSns: Option[String] = configuration.getStringProperty("r2press.sns.topic")
    lazy val r2PressTakedownSns: Option[String] = configuration.getStringProperty("r2press.takedown.sns.topic")

    def mandatoryCredentials: AWSCredentialsProvider =
      credentials.getOrElse(throw new BadConfigurationException("AWS credentials are not configured"))
    val credentials: Option[AWSCredentialsProvider] = {
      val provider = new AWSCredentialsProviderChain(
        new ProfileCredentialsProvider("frontend"),
        InstanceProfileCredentialsProvider.getInstance(),
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
    lazy val url: String = configuration.getMandatoryStringProperty("riffraff.url")
    lazy val apiKey: String = configuration.getMandatoryStringProperty("riffraff.apikey")
  }

  object standalone {
    lazy val oauthCredentials: Option[OAuthCredentials] = for {
      oauthClientId <- configuration.getStringProperty("standalone.oauth.clientid")
      // TODO needs the orElse fallback till we roll out new properties files
      oauthSecret <-
        configuration
          .getStringProperty("standalone.oauth.secret")
          .orElse(configuration.getStringProperty("preview.oauth.secret"))
      oauthCallback <- configuration.getStringProperty("standalone.oauth.callback")
    } yield OAuthCredentials(oauthClientId, oauthSecret, oauthCallback)
  }

  object googleOAuth {
    lazy val playAppSecretParameterName: String = s"/frontend/${stage.toLowerCase()}/${app.toLowerCase()}/playAppSecret"
  }

  object pngResizer {
    val cacheTimeInSeconds: Int = configuration.getIntegerProperty("png_resizer.image_cache_time").getOrElse(86400)
    val ttlInSeconds: Int = configuration.getIntegerProperty("png_resizer.image_ttl").getOrElse(86400)
  }

  object emailSignup {
    val url: String = configuration.getMandatoryStringProperty("email.signup.url")
  }

  object Logstash {
    lazy val enabled: Boolean = configuration.getStringProperty("logstash.enabled").exists(_.toBoolean)
    lazy val stream: Option[String] = configuration.getStringProperty("logstash.stream.name")
    lazy val streamRegion: Option[String] = configuration.getStringProperty("logstash.stream.region")
  }

  object Elk {
    lazy val kibanaUrl: Option[String] = configuration.getStringProperty("elk.kibana.url")
  }

  object Survey {
    lazy val formStackAccountName: String = "guardiannewsampampmedia"
  }

  object Media {
    lazy val externalEmbedHost: String = configuration.getMandatoryStringProperty("guardian.page.externalEmbedHost")
  }

  object braze {
    lazy val apiKey: String = configuration.getStringProperty("braze.apikey").getOrElse("")
  }

  object newsletterApi {
    lazy val host: Option[String] = configuration.getStringProperty("newsletterApi.host")
    lazy val origin: Option[String] = configuration.getStringProperty("newsletterApi.origin")
  }
}

object ManifestData {
  lazy val build = ManifestFile.asKeyValuePairs.getOrElse("Build", "DEV").dequote.trim
  lazy val revision = ManifestFile.asKeyValuePairs.getOrElse("Revision", "DEV").dequote.trim
}
