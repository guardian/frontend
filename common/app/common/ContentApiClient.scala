package common

import com.gu.openplatform.contentapi.Api
import com.gu.openplatform.contentapi.connection.{ Proxy => ContentApiProxy, Http, DispatchHttp }
import com.gu.management.{ Metric, TimingMetric }
import conf.Configuration

trait ApiQueryDefaults { self: Api =>

  val supportedTypes = "type/gallery|type/article|type/video"

  //NOTE - do NOT add body to this list
  val trailFields = "headline,trail-text,liveBloggingNow,thumbnail,showInRelatedContent,wordcount"

  val references = "pa-football-competition,pa-football-team"

  //common fileds that we use across most queries.
  def item(id: String, edition: String): ItemQuery = item.itemId(id)
    .edition(edition)
    .showTags("all")
    .showFields(trailFields)
    .showInlineElements("picture")
    .showMedia("all")
    .showReferences(references)
    .showStoryPackage(true)
    .tag(supportedTypes)

  //common fields that we use across most queries.
  def search(edition: String): SearchQuery = search
    .edition(edition)
    .showTags("all")
    .showInlineElements("picture")
    .showReferences(references)
    .showFields(trailFields)
    .showMedia("all")
    .tag(supportedTypes)
}

trait DelegateHttp extends Http {

  private val dispatch = new DispatchHttp with Logging {
    import Configuration.{ proxy => proxyConfig, _ }

    override lazy val maxConnections = 100
    override lazy val connectionTimeoutInMs = 200
    override lazy val requestTimeoutInMs = 2000
    override lazy val compressionEnabled = true

    override lazy val proxy: Option[ContentApiProxy] = if (proxyConfig.isDefined) {
      log.info("Setting HTTP proxy to: %s:%s".format(proxyConfig.host, proxyConfig.port))
      Some(ContentApiProxy(proxyConfig.host, proxyConfig.port))
    } else None
  }

  private var _http: Http = dispatch
  def http = _http
  def http_=(delegateHttp: Http) = _http = delegateHttp

  def GET(url: String, headers: scala.Iterable[scala.Tuple2[String, String]]) = _http.GET(url, headers)
}

class ContentApiClient(configuration: GuardianConfiguration) extends Api with ApiQueryDefaults with DelegateHttp
    with Logging {
  import Configuration.contentApi
  override val targetUrl = contentApi.host
  apiKey = Some(contentApi.key)

  override protected def fetch(url: String, parameters: Map[String, Any]) = {

    checkQueryIsEditionalized(url, parameters)

    metrics.ContentApiHttpTimingMetric.measure {
      super.fetch(url, parameters + ("user-tier" -> "internal"))
    }
  }

  object metrics {
    object ContentApiHttpTimingMetric extends TimingMetric(
      "performance",
      "content-api-calls",
      "Content API calls",
      "outgoing requests to content api",
      Some(RequestMetrics.RequestTimingMetric)
    ) with TimingMetricLogging

    val all: Seq[Metric] = Seq(ContentApiHttpTimingMetric)
  }

  private def checkQueryIsEditionalized(url: String, parameters: Map[String, Any]) {
    //you cannot editionalize tag queries
    if (!isTagQuery(url) && !parameters.isDefinedAt("edition")) throw new IllegalArgumentException(
      "You should never, Never, NEVER create a query that does not include the edition. EVER: " + url
    )
  }

  private def isTagQuery(url: String) = url.endsWith("/tags")
}

