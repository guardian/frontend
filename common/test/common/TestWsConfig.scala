package common

import com.ning.http.client.AsyncHttpClient
import com.ning.http.client.AsyncHttpClientConfig.Builder
import play.api.libs.ws.WS
import play.api.libs.ws.ning.NingWSClient
import play.api.Play.current

trait TestWsConfig {

  implicit lazy val longTimeoutConfig = {
    val c = WS.client.underlying.asInstanceOf[AsyncHttpClient].getConfig
    val con = new Builder(c)
      .setConnectTimeout(10000)
      .setReadTimeout(10000)
      .setRequestTimeout(10000)
      .build()
    new NingWSClient(con)
  }

}
