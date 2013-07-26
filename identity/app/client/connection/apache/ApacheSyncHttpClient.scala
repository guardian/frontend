package client.connection.apache

import org.apache.commons.httpclient.{HttpMethod, HttpClient, NameValuePair}
import scala.io.Source
import org.apache.commons.httpclient.methods.{DeleteMethod, StringRequestEntity, PostMethod, GetMethod}
import client.connection.{HttpResponse, Http}
import client.Parameters


// an implementation using apache http client, note this just uses the default connection manager
// and does not support multithreaded use.
trait ApacheSyncHttpClient extends Http {
  // provide converter between our Iterable[(String,String)] and the ApacheClient's Array[KeyValuePair]
  implicit object IterStringTupleToArrayNameValuePairs extends (Parameters => Array[NameValuePair]) {
    def apply(iterStringTuple: Parameters) = iterStringTuple.toArray.map { case (k, v) => new NameValuePair(k, v) }
  }

  val httpClient = new HttpClient

  def setProxy(host: String, port: Int) {
    httpClient.getHostConfiguration.setProxy(host, port)
  }

  def execute(method: HttpMethod, urlParameters: Parameters, headers: Parameters): HttpResponse = {
    try {
      headers.foreach { case (k, v) => method.addRequestHeader(k, v) }
      method.setQueryString(urlParameters)

      httpClient.executeMethod(method)

      val statusLine = method.getStatusLine
      val responseBody = Option(method.getResponseBodyAsStream)
        .map(Source.fromInputStream(_).mkString)
        .getOrElse("")

      new HttpResponse(responseBody, statusLine.getStatusCode, statusLine.getReasonPhrase)
    } finally {
      method.releaseConnection()
    }
  }

  override def GET(url: String, urlParameters: Parameters = Nil, headers: Parameters = Nil): HttpResponse = {
    val method = new GetMethod(url)
    execute(method, urlParameters, headers)
  }

  override def POST(url: String, body: String, urlParameters: Parameters = Nil, headers: Parameters = Nil): HttpResponse = {
    val method = new PostMethod(url)
    method.setRequestEntity(new StringRequestEntity(body, "application/json", "UTF-8"))
    execute(method, urlParameters, headers)
  }

  override def DELETE(url: String, bodyOpt: Option[String] = None, urlParameters: Parameters = Nil, headers: Parameters = Nil): HttpResponse = {
    val method = if (bodyOpt.isDefined) {
      val deleteWithBody = new DeleteMethodWithBody(url)
      deleteWithBody.setRequestEntity(new StringRequestEntity(bodyOpt.get, "application/json", "UTF-8"))
      deleteWithBody
    } else new DeleteMethod(url)
    execute(method, urlParameters, headers)
  }
}
class DefaultApacheSyncHttpClient extends ApacheSyncHttpClient
