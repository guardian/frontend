package common

import com.gu.openplatform.contentapi.Api
import com.gu.openplatform.contentapi.connection.MultiThreadedApacheHttpClient
import com.gu.management.{ Metric, GaugeMetric, TimingMetric }

trait ApiQueryDefaults { self: Api =>

  val supportedTypes = "type/gallery|type/article|type/video"

  //NOTE - do NOT add body to this list
  val trailFields = "trail-text,liveBloggingNow"

  //common fileds that we use across most queries.
  def item(id: String, edition: String): ItemQuery = item.itemId(id)
    .edition(edition)
    .showTags("all")
    .showFields(trailFields)
    .showInlineElements("picture")
    .showMedia("all")
    .showStoryPackage(true)
    .tag(supportedTypes)
}

class ContentApiClient(configuration: GuardianConfiguration) extends Api with ApiQueryDefaults
    with MultiThreadedApacheHttpClient
    with Logging {

  import configuration._

  override val targetUrl = contentApi.host
  apiKey = Some(contentApi.key)

  maxConnections(1000)

  if (proxy.isDefined) {
    log.info("Setting HTTP proxy to: %s:%s".format(proxy.host, proxy.port))
    setProxy(proxy.host, proxy.port)
  }

  override protected def fetch(url: String, parameters: Map[String, Any]) = {
    if (!parameters.isDefinedAt("edition")) throw new IllegalArgumentException(
      "You should never, Never, NEVER create a query that does not include the edition. EVER"
    )

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

    object ContentApiHttpClientCollectionPoolSize extends GaugeMetric(
      "performance",
      "contentapi_httpclient_connection_pool",
      "Content API HttpClient connection pool",
      "HttpClient connection pool size",
      () => connectionManager.getConnectionsInPool()
    )

    val all: Seq[Metric] = Seq(ContentApiHttpTimingMetric, ContentApiHttpClientCollectionPoolSize)
  }
}

