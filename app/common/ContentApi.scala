package common

import com.gu.openplatform.contentapi.Api
import com.gu.openplatform.contentapi.connection.MultiThreadedApacheHttpClient

class ContentApi(configuration: Configuration) extends Api
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
    super.fetch(url, parameters + ("user-tier" -> "internal"))
  }
}