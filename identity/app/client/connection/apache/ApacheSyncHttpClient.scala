package client.connection.apache

import java.io.IOException
import java.lang.IllegalArgumentException
import org.apache.commons.httpclient.methods.{DeleteMethod, StringRequestEntity, PostMethod, GetMethod}
import org.apache.commons.httpclient.{HttpException, HttpMethod, HttpClient, NameValuePair, URIException}
import client.connection.{Http, HttpResponse}
import client.{Error, Parameters, Response}
import client.connection.Proxy
import scala.concurrent.{Future, Promise}


// an implementation using apache http client, note this just uses the default connection manager
// and does not support multithreaded use.
class ApacheSyncHttpClient extends Http {
  // provide converter between our Iterable[(String,String)] and the ApacheClient's Array[KeyValuePair]
  implicit object IterStringTupleToArrayNameValuePairs extends (Parameters => Array[NameValuePair]) {
    def apply(iterStringTuple: Parameters) = iterStringTuple.toArray.map { case (k, v) => new NameValuePair(k, v) }
  }
  val proxy: Option[Proxy] = None

  val httpClient = new HttpClient
  proxy.foreach(p => httpClient.getHostConfiguration.setProxy(p.host, p.port))

  def execute(method: HttpMethod, urlParameters: Parameters, headers: Parameters): Response[HttpResponse] = {
    try {
      headers.foreach { case (k, v) => method.addRequestHeader(k, v) }
      method.setQueryString(urlParameters)

      httpClient.executeMethod(method)

      val responseBody = Option(method.getResponseBodyAsString).getOrElse("")

      Right(new HttpResponse(responseBody, method.getStatusCode, method.getStatusText))
    } catch {
      case e: HttpException => {
        logger.error("HttpException while attempting %s on %s".format(method.getName, method.getURI), e)
        Left(List(Error("HttpException", e.getMessage)))
      }
      case e: IOException => {
        logger.error("IOException while attempting %s on %s".format(method.getName, method.getURI), e)
        Left(List(Error("IOException", e.getMessage)))
      }
    } finally {
      method.releaseConnection()
    }
  }

  override def GET(url: String, urlParameters: Parameters = Nil, headers: Parameters = Nil): Future[Response[HttpResponse]] = {
    logger.debug("GET request %s; params: %s; headers: %s".format(url, formatParams(urlParameters), formatParams(headers)))
    val response = try {
      val method = new GetMethod(url)
      execute(method, urlParameters, headers)
    } catch {
      case e: IllegalArgumentException => {
        logger.error("IllegalArgumentException (invalid URI) while attempting GET on %s".format(url), e)
        Left(List(Error("IllegalArgumentException", e.getMessage)))
      }
      case e: IllegalStateException => {
        logger.error("IllegalStateException (unrecognised URI protocol) while attempting GET on %s".format(url), e)
        Left(List(Error("IllegalStateException", e.getMessage)))
      }
      case e: URIException => {
        logger.error("URIException (URI cannot be set) while attempting GET on %s".format(url), e)
        Left(List(Error("URIException", e.getMessage)))
      }
    }
    Promise.successful(response).future
  }

  override def POST(url: String, bodyOpt: Option[String], urlParameters: Parameters = Nil, headers: Parameters = Nil): Future[Response[HttpResponse]] = {
    logger.debug("POST request %s; params: %s; headers: %s".format(url, formatParams(urlParameters), formatParams(headers)))
    logger.trace("POST body %s".format(bodyOpt))
    val response = try {
      val method = new PostMethod(url)
      if(bodyOpt.isDefined) {
        method.setRequestEntity(new StringRequestEntity(bodyOpt.get, "application/json", "UTF-8"))
      }
      execute(method, urlParameters, headers)
    } catch {
      case e: IllegalArgumentException => {
        logger.error("IllegalArgumentException (invalid URI) while attempting POST on %s".format(url), e)
        Left(List(Error("IllegalArgumentException", e.getMessage)))
      }
      case e: IllegalStateException => {
        logger.error("IllegalStateException (unrecognised URI protocol) while attempting POST on %s".format(url), e)
        Left(List(Error("IllegalStateException", e.getMessage)))
      }
      case e: URIException => {
        logger.error("URIException (URI cannot be set) while attempting POST on %s".format(url), e)
        Left(List(Error("URIException", e.getMessage)))
      }
    }
    Promise.successful(response).future
  }

  override def DELETE(url: String, bodyOpt: Option[String] = None, urlParameters: Parameters = Nil, headers: Parameters = Nil): Future[Response[HttpResponse]] = {
    logger.debug("DELETE request %s; params: %s; headers: %s".format(url, formatParams(urlParameters), formatParams(headers)))
    logger.trace("DELETE body %s".format(bodyOpt))
    val response = try {
      val method = if (bodyOpt.isDefined) {
        val deleteWithBody = new DeleteMethodWithBody(url)
        deleteWithBody.setRequestEntity(new StringRequestEntity(bodyOpt.get, "application/json", "UTF-8"))
        deleteWithBody
      } else new DeleteMethod(url)
      execute(method, urlParameters, headers)
    } catch {
      case e: IllegalArgumentException => {
        logger.error("IllegalArgumentException (invalid URI) while attempting DELETE on %s".format(url), e)
        Left(List(Error("IllegalArgumentException", e.getMessage)))
      }
      case e: IllegalStateException => {
        logger.error("IllegalStateException (unrecognised URI protocol) while attempting DELETE on %s".format(url), e)
        Left(List(Error("IllegalStateException", e.getMessage)))
      }
      case e: URIException => {
        logger.error("URIException (URI cannot be set) while attempting DELETE on %s".format(url), e)
        Left(List(Error("URIException", e.getMessage)))
      }
    }
    Promise.successful(response).future
  }
}
