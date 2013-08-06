package client.connection.apache

import org.apache.commons.httpclient.{HttpClient, MultiThreadedHttpConnectionManager}


// an implementation using the MultiThreadedHttpConnectionManager
class MultiThreadedApacheSyncHttpClient extends ApacheSyncHttpClient {
  val connectionManager = new MultiThreadedHttpConnectionManager
  override val httpClient = new HttpClient(connectionManager)

  maxConnections(10)

  def maxConnections(i: Int) {
    connectionManager.getParams.setMaxTotalConnections(i)
    connectionManager.getParams.setDefaultMaxConnectionsPerHost(i)
  }

  def setConnectionTimeout(ms: Int) {
    connectionManager.getParams.setConnectionTimeout(ms)
  }

  def setSocketTimeout(ms: Int) {
    connectionManager.getParams.setSoTimeout(ms)
  }
}
