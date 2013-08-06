package client.connection.dispatch

import scala.concurrent.{ExecutionContext, Future}
import dispatch.{Req, FunctionHandler, EnrichedFuture, url}
import com.ning.http.client.{AsyncHttpClient, AsyncHttpClientConfig, ProxyServer}
import com.ning.http.client.providers.netty.{NettyAsyncHttpProvider, NettyConnectionsPool}
import client.{Error, Parameters, Response}
import client.connection.{Http, Proxy, HttpResponse}


trait DispatchAsyncHttpClient extends Http {

  lazy val maxConnections: Int = 20
  lazy val maxConnectionsPerHost: Int = 20
  lazy val connectionTimeoutInMs: Int = 1000
  lazy val requestTimeoutInMs: Int = 10000
  lazy val proxy: Option[Proxy] = None
  lazy val compressionEnabled: Boolean = true
  lazy val allowPoolingConnection: Boolean = true
  val config = {
    val builder = new AsyncHttpClientConfig.Builder()
      .setCompressionEnabled(compressionEnabled)
      .setAllowPoolingConnection(allowPoolingConnection)
      .setRequestTimeoutInMs(requestTimeoutInMs)
      .setConnectionTimeoutInMs(connectionTimeoutInMs)
      .setMaximumConnectionsPerHost(maxConnectionsPerHost)
      .setMaximumConnectionsTotal(maxConnections)
    proxy.foreach(p => builder.setProxyServer(new ProxyServer(p.host, p.port)))
    builder.build
  }
  class Client(client: AsyncHttpClient) extends dispatch.Http(client)
  val asyncHttpClient = {
    val connectionPool = new NettyConnectionsPool(new NettyAsyncHttpProvider(config))
    new AsyncHttpClient(new AsyncHttpClientConfig.Builder(config).setConnectionsPool(connectionPool).build)
  }
  val client = new Client(asyncHttpClient)
  implicit def executionContext: ExecutionContext

  def buildRequest(request: Req, urlParameters: Parameters, headers: Parameters): Req = {
    urlParameters.foreach(param => {
      request.addQueryParameter(param._1, param._2)
    })
    headers.foreach(header => {
      request.addHeader(header._1, header._2)
    })
    request
  }

  def httpResponseHandler = new FunctionHandler(response =>
    HttpResponse(response.getResponseBody("utf-8"), response.getStatusCode, response.getStatusText)
  )

  def mapFutureToResponse(dispatchResponse: Either[scala.Throwable, HttpResponse]): Response[HttpResponse] = {
    dispatchResponse match {
      case Left(throwable) => Left(List(Error(throwable.getClass.getName, throwable.getMessage)))
      case Right(httpResponse) => Right(httpResponse)
    }
  }

  override def GET(uri: String, urlParameters: Parameters, headers: Parameters): Future[Response[HttpResponse]] = {
    val req = buildRequest(url(uri), urlParameters, headers)
    new EnrichedFuture(client(req.toRequest, httpResponseHandler)).either.map(mapFutureToResponse)
  }

  override def POST(uri: String, body: Option[String], urlParameters: Parameters, headers: Parameters): Future[Response[HttpResponse]] = {
    val req = buildRequest(url(uri).POST, urlParameters, headers)
    body.foreach(req.setBody)
    new EnrichedFuture(client(req.toRequest, httpResponseHandler)).either.map(mapFutureToResponse)
  }

  override def DELETE(uri: String, body: Option[String], urlParameters: Parameters, headers: Parameters): Future[Response[HttpResponse]] = {
    val req = buildRequest(url(uri).DELETE, urlParameters, headers)
    body.foreach(req.setBody)
    new EnrichedFuture(client(req.toRequest, httpResponseHandler)).either.map(mapFutureToResponse)
  }
}
