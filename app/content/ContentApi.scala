package content

import com.gu.openplatform.contentapi.Api
import com.gu.openplatform.contentapi.connection.MultiThreadedApacheHttpClient
import conf.Configuration
import frontend.common.Logging

object ContentApi extends Api with MultiThreadedApacheHttpClient with Logging {

  import Configuration._

  override val targetUrl = contentApi.host
  apiKey = Some(contentApi.key)

  maxConnections(1000)

  def setProxy(host: String, port: Int) {
    httpClient.getHostConfiguration.setProxy(host, port)
  }

  if (proxy.isDefined) {
    log.info("Setting HTTP proxy to: %s:%s".format(proxy.host, proxy.port))
    setProxy(proxy.host, proxy.port)
  }

  override protected def fetch(url: String, parameters: Map[String, Any]) = {
    super.fetch(url, parameters + ("user-tier" -> "internal"))
  }
}