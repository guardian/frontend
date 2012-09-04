package common

import com.gu.openplatform.contentapi.Api
import com.gu.openplatform.contentapi.connection.{ DispatchHttp, Proxy }
import com.gu.management.{ Metric, TimingMetric }

trait ApiQueryDefaults { self: Api =>

  val supportedTypes = "type/gallery|type/article|type/video"

  //NOTE - do NOT add body to this list
  val standardFields = "trail-text,liveBloggingNow,thumbnail,"

  //common fileds that we use across most queries.
  def item(id: String, edition: String): ItemQuery = item.itemId(id)
    .edition(edition)
    .showTags("all")
    .showFields(standardFields)
    .showInlineElements("picture")
    .showMedia("all")
    .showStoryPackage(true)
    .tag(supportedTypes)
}

class ContentApiClient(configuration: GuardianConfiguration) extends Api with ApiQueryDefaults with DispatchHttp
    with Logging {

  import configuration.{ proxy => proxyConfig, _ }

  override val targetUrl = contentApi.host
  apiKey = Some(contentApi.key)

  override lazy val maxConnections = 100
  override lazy val connectionTimeoutInMs = 200
  override lazy val requestTimeoutInMs = 2000
  override lazy val compressionEnabled = true

  override lazy val proxy: Option[Proxy] = if (proxyConfig.isDefined) {
    log.info("Setting HTTP proxy to: %s:%s".format(proxyConfig.host, proxyConfig.port))
    Some(Proxy(proxyConfig.host, proxyConfig.port))
  } else None

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

