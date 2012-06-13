package common

import common.ContentApiMetrics.ContentApiHttpTimingMetric
import com.gu.openplatform.contentapi.Api
import com.gu.openplatform.contentapi.connection.MultiThreadedApacheHttpClient
import com.gu.management.TimingMetric

class ContentApiClient(configuration: GuardianConfiguration, httpTimer: TimingMetric = ContentApiHttpTimingMetric) extends Api
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

    httpTimer.measure {
      super.fetch(url, parameters + ("user-tier" -> "internal"))
    }
  }
}