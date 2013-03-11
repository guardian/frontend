package common

import com.ning.http.client.{ AsyncHttpClient, ProxyServer, AsyncHttpClientConfig }
import com.ning.http.client.providers.netty.{ NettyAsyncHttpProvider, NettyConnectionsPool }
import dispatch.{ FunctionHandler, url }

case class Response(status: Int, body: String, statusLine: String)

object Proxy {
  def apply(config: GuardianConfiguration) = if (config.proxy.isDefined) {
    Some(new ProxyServer(config.proxy.host, config.proxy.port))
  } else {
    None
  }
}

trait HttpSupport {

  lazy val maxConnections: Int = 10
  lazy val connectionTimeoutInMs: Int = 1000
  lazy val requestTimeoutInMs: Int = 2000
  def proxy: Option[ProxyServer]
  lazy val compressionEnabled: Boolean = true

  lazy val config = {
    val c = new AsyncHttpClientConfig.Builder()
      .setAllowPoolingConnection(true)
      .setMaximumConnectionsPerHost(maxConnections)
      .setMaximumConnectionsTotal(maxConnections)
      .setConnectionTimeoutInMs(connectionTimeoutInMs)
      .setRequestTimeoutInMs(requestTimeoutInMs)
      .setCompressionEnabled(compressionEnabled)
      .setFollowRedirects(true)
    proxy.foreach(c.setProxyServer(_))
    c.build
  }

  object Client extends dispatch.Http {
    override val client = {
      val connectionPool = new NettyConnectionsPool(new NettyAsyncHttpProvider(config))
      new AsyncHttpClient(new AsyncHttpClientConfig.Builder(config).setConnectionsPool(connectionPool).build)
    }
  }

  object http {

    def GET(urlString: String): Response = {
      val request = url(urlString).build
      Client(request, httpResponseHandler)()
    }
  }

  def httpResponseHandler = new FunctionHandler(r =>
    Response(r.getStatusCode, r.getResponseBody("utf-8"), r.getStatusText)
  )

  def close() = Client.client.close()
}