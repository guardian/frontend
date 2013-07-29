package client.connection.javanet

import java.net._
import scala.io.Source
import client.connection.Http
import client.{Error, Parameters, Response}
import java.io.{IOException, OutputStreamWriter}
import java.lang.NullPointerException
import client.connection.HttpResponse


// an implementation using java.net for Google AppEngine
class JavaNetSyncHttpClient extends Http {

  override protected def doGET(urlString: String, parameters: Parameters = Nil, headers: Parameters = Nil): Response[HttpResponse] = {
    getConnection(urlString, parameters, headers, "GET")
      .right.flatMap(extractHttpResponse)
  }

  override protected def doPOST(url: String, body: String, urlParameters: Parameters = Nil, headers: Parameters = Nil): Response[HttpResponse] = {
    getConnection(url, urlParameters, headers, "POST").right
      .flatMap(writeBodyContent(_, body)).right
      .flatMap(extractHttpResponse)
  }

  override protected def doDELETE(url: String, bodyOpt: Option[String] = None, urlParameters: Parameters = Nil, headers: Parameters = Nil): Response[HttpResponse] = {
    getConnection(url, urlParameters, headers, "DELETE").right
      .flatMap(connection => {
        bodyOpt.foreach(writeBodyContent(connection, _))
        extractHttpResponse(connection)
      })
  }

  private def addQueryString(url: String, params: Parameters): String = {
    val separator = if (url.contains("?")) "&" else "?"
    url + {
      if (params.isEmpty) ""
      else params.map {
        case (k, v) => URLEncoder.encode(k, "UTF-8") + "=" + URLEncoder.encode(v, "UTF-8")
      }.mkString(separator, "&", "")
    }
  }

  protected def getURL(url: String): HttpURLConnection = {
    new URL(url).openConnection.asInstanceOf[HttpURLConnection]
  }

  def getConnection(url: String, urlParameters: Parameters, headers: Parameters, method: String): Response[HttpURLConnection] = {
    try {
      val connection = getURL(addQueryString(url, urlParameters))
      connection.setRequestMethod(method)
      headers.foreach { case (k, v) => connection.setRequestProperty(k, v) }
      Right(connection)
    } catch {
      case e: MalformedURLException => {
        logger.error("MalformedURLException", e)
        Left(List(Error("MalformedURLException", e.getMessage)))
      }
      case e: ProtocolException => {
        logger.error("ProtocolException", e)
        Left(List(Error("ProtocolException", e.getMessage)))
      }
      case e: IllegalStateException => {
        logger.error("IllegalStateException, already connected and attempting to add request header", e)
        Left(List(Error("IllegalStateException", e.getMessage)))
      }
      case e: NullPointerException => {
        logger.error("NullPointerException", e)
        Left(List(Error("NullPointerException", e.getMessage)))
      }
      case e: IOException => {
        logger.error("IOException opening connection", e)
        Left(List(Error("IOException", e.getMessage)))
      }
    }
  }

  def writeBodyContent(connection: HttpURLConnection, body: String): Response[HttpURLConnection] = {
    try {
      connection.setDoOutput(true)
      val writer = new OutputStreamWriter(connection.getOutputStream, "UTF-8")
      writer.write(body)
      writer.close()
      Right(connection)
    } catch {
      case e: IllegalStateException => {
        logger.error("IllegalStateException, cannot set doOutput when already connected", e)
        Left(List(Error("IllegalStateException", e.getMessage)))
      }
      case e: NullPointerException => {
        logger.error("NullPointerException, null character set provided", e)
        Left(List(Error("NullPointerException", e.getMessage)))
      }
      case e: IOException => {
        logger.error("IOException while writing request body", e)
        Left(List(Error("IOException", e.getMessage)))
      }
    }
  }

  private def extractHttpResponse(connection: HttpURLConnection): Response[HttpResponse] = {
    try {
      val src = Source.fromInputStream(connection.getInputStream)
      val responseBody = src.mkString
      src.close()
      Right(new HttpResponse(responseBody, connection.getResponseCode, connection.getResponseMessage))
    } catch {
      case e: IOException => {
        logger.error("IOException while extracting response body", e)
        Left(List(Error("IOException", e.getMessage)))
      }
    }
  }
}
