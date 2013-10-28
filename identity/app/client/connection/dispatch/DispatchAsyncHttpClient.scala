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

  implicit object IterStringTupleToArrayNameValuePairs extends (Parameters => Map[String, Seq[String]]) {
    def apply(iterStringTuple: Parameters) = iterStringTuple.toMap.groupBy(_._1).map {
      case (key, map) => (key, map.values.toSeq)
    }
  }

  def buildRequest(request: dispatch.Req, urlParameters: Parameters, headers: Parameters): Req = {
    request.setQueryParameters(urlParameters).setHeaders(headers)
  }

  def httpResponseHandler = new FunctionHandler(response =>
    HttpResponse(response.getResponseBody("utf-8"), response.getStatusCode, response.getStatusText)
  )

  def mapFutureToResponse(dispatchResponse: Either[scala.Throwable, HttpResponse]): Response[HttpResponse] = {
    dispatchResponse match {
      case Left(throwable) => Left(List(Error(throwable.getClass.getName, throwable.toString)))
      case Right(httpResponse) => Right(httpResponse)
    }
  }

  override def GET(uri: String, urlParameters: Parameters, headers: Parameters): Future[Response[HttpResponse]] = {
    logger.debug("GET request %s; params: %s; headers: %s".format(uri, formatParams(urlParameters), formatParams(headers)))
    val req = buildRequest(url(uri), urlParameters, headers)
    val futureResponse = new EnrichedFuture(client(req.toRequest, httpResponseHandler)).either
    futureResponse.onFailure{ case t: Throwable =>
      logger.error("Exception GETing on %s, params: %s, headers: %s".format(uri, formatParams(urlParameters), formatParams(headers)), t)
    }
    futureResponse.onSuccess{ case Left(t) =>
      logger.error("GET Error on %s, params: %s, headers: %s".format(uri, formatParams(urlParameters), formatParams(headers)), t)
    }
    futureResponse.map(mapFutureToResponse)
  }

  override def POST(uri: String, body: Option[String], urlParameters: Parameters, headers: Parameters): Future[Response[HttpResponse]] = {
    logger.debug("POST request %s; params: %s; headers: %s".format(uri, formatParams(urlParameters), formatParams(headers)))
    logger.trace("POST body %s".format(body))
    val req = buildRequest(url(uri).POST, urlParameters, headers)
    val request = body.map(req.setBody).getOrElse(req).toRequest
    val futureResponse = new EnrichedFuture(client(request, httpResponseHandler)).either
    futureResponse.onFailure{ case t: Throwable =>
      logger.error("Exception POSTing on %s, params: %s, headers: %s".format(uri, formatParams(urlParameters), formatParams(headers)), t)
    }
    futureResponse.onSuccess{ case Left(t) =>
      logger.error("POST Error on %s, params: %s, headers: %s".format(uri, formatParams(urlParameters), formatParams(headers)), t)
    }
    futureResponse.collect {
      case Right(HttpResponse(body, statusCode, _)) => logger.error(s"statusCode: $statusCode, body: $body")
    }
    futureResponse.map(mapFutureToResponse)
  }

  override def DELETE(uri: String, body: Option[String], urlParameters: Parameters, headers: Parameters): Future[Response[HttpResponse]] = {
    logger.debug("DELETE request %s; params: %s; headers: %s".format(uri, formatParams(urlParameters), formatParams(headers)))
    logger.trace("DELETE body %s".format(body))
    val req = buildRequest(url(uri).DELETE, urlParameters, headers)
    val request = body.map(req.setBody).getOrElse(req).toRequest
    val futureResponse = new EnrichedFuture(client(request, httpResponseHandler)).either
    futureResponse.onFailure{ case t: Throwable =>
      logger.error("Exception DELETEing on %s, params: %s, headers: %s".format(uri, formatParams(urlParameters), formatParams(headers)), t)
    }
    futureResponse.onSuccess{ case Left(t) =>
      logger.error("DELETE Error on %s, params: %s, headers: %s".format(uri, formatParams(urlParameters), formatParams(headers)), t)
    }
    futureResponse.map(mapFutureToResponse)
  }
}
