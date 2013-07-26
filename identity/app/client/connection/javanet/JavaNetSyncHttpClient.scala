package client.connection.javanet

import java.net.{URLEncoder, HttpURLConnection, URL}
import scala.io.Source
import client.connection.{HttpResponse, Http}
import client.Parameters
import java.io.OutputStreamWriter


// an implementation using java.net for Google AppEngine
class JavaNetSyncHttpClient extends Http {

  override def doGET(urlString: String, parameters: Parameters = Nil, headers: Parameters = Nil): HttpResponse = {
    val connection = getConnection(urlString, parameters, headers, "GET")
    extractHttpResponse(connection)
  }

  override def doPOST(url: String, body: String, urlParameters: Parameters = Nil, headers: Parameters = Nil): HttpResponse = {
    val connection = getConnection(url, urlParameters, headers, "POST")
    writeBodyContent(connection, body)
    extractHttpResponse(connection)
  }

  override def doDELETE(url: String, bodyOpt: Option[String] = None, urlParameters: Parameters = Nil, headers: Parameters = Nil): HttpResponse = {
    val connection = getConnection(url, urlParameters, headers, "DELETE")
    bodyOpt.foreach(writeBodyContent(connection, _))
    extractHttpResponse(connection)
  }

  private def addQueryString(url: String, params: Parameters): String = {
    val separator = if (url.contains("?")) "&" else "?"
    url + {
      if (params.isEmpty) ""
      else separator + params.map {
        case (k, v) => URLEncoder.encode(k, "UTF-8") + "=" + URLEncoder.encode(v, "UTF-8")
      }.mkString(separator, "&", "")
    }
  }

  private def getConnection(url: String, urlParameters: Parameters, headers: Parameters, method: String): HttpURLConnection = {
    // MalformedURLException
    val connection = new URL(addQueryString(url, urlParameters)).openConnection.asInstanceOf[HttpURLConnection]
    connection.setRequestMethod(method)
    headers.foreach { case (k, v) => connection.setRequestProperty(k, v) }
    connection
  }

  private def writeBodyContent(connection: HttpURLConnection, body: String): HttpURLConnection = {
    connection.setDoOutput(true)
    val writer = new OutputStreamWriter(connection.getOutputStream)
    writer.write(body)
    writer.close()
    connection
  }

  private def extractHttpResponse(connection: HttpURLConnection): HttpResponse = {
    // IOException
    val src = Source.fromInputStream(connection.getInputStream)
    val responseBody = src.mkString
    src.close()
    new HttpResponse(responseBody, connection.getResponseCode, connection.getResponseMessage)
  }
}
