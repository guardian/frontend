package recorder

import java.io._
import java.net.URI
import java.nio.ByteBuffer
import java.nio.file.{Files, Paths}
import java.util

import com.ning.http.client.uri.Uri
import com.ning.http.client.{FluentCaseInsensitiveStringsMap, Response => AHCResponse}
import common.ExecutionContexts
import conf.Configuration
import org.apache.commons.codec.digest.DigestUtils
import play.api.libs.ws.WSResponse
import play.api.libs.ws.ning.NingWSResponse

import scala.concurrent.Future
import scala.io.Codec.UTF8

trait HttpRecorder[A] extends ExecutionContexts {

  def baseDir: File

  final def load(url: String, headers: Map[String, String] = Map.empty)(fetch: => Future[A]): Future[A] =
    loadFile(url, headers)(fetch).map(file => toResponse(contentFromFile(file)))


  // loads api call from disk. if it cannot be found on disk go get it and save to disk
  final def loadFile(url: String, headers: Map[String, String] = Map.empty)(fetch: => Future[A]): Future[File] = {

    val (fileName, components) = name(url, headers)

    get(fileName).map(Future(_)).getOrElse {
      if (Configuration.environment.stage.equalsIgnoreCase("DEVINFRA")) {
        // integration test environment
        // make sure people have checked in test files
        throw new IllegalStateException(s"Data file has not been checked in for: $url - $components, file: $fileName, headers: ${headersFormat(headers)}")
      } else {
        // always get the new files, this means we'll find out fast when we've broken stuff
        // otherwise it's impossible to regenerate things because everything's been running off the checked in file
        // even when it was broken :(
        fetch.map(r => put(fileName, fromResponse(r)))
      }
    }

  }

  if (!baseDir.exists()) {
    baseDir.mkdirs()
    baseDir.mkdir()
  }

  private def put(name: String, value: Array[Byte]): File = {
    val file = new File(baseDir, name)
    val out = new FileOutputStream(file)
    out.write(value)
    out.close()
    file
  }

  private def get(name: String): Option[File] = {
    val file = new File(baseDir, name)
    if (file.exists()) {
      Some(file)
    } else {
      None
    }
  }

  private def contentFromFile(file: File): Array[Byte] = Files.readAllBytes(Paths.get(file.getPath))

  def toResponse(str: Array[Byte]): A

  def fromResponse(response: A): Array[Byte]

  private def headersFormat(headers: Map[String, String]): String = {
    headers.toList.sortBy(_._1).map{ case (key, value) => key + value }.mkString
  }

  private [recorder] def name(url: String, headers: Map[String, String]): (String, String) = {
    val uri = URI.create(url)
    // remove the host because it's probably a config value that won't be there in automation
    val key = uri.getPath + uri.getQuery + headersFormat(headers)
    (DigestUtils.sha256Hex(key), key)
  }

}

trait DefaultHttpRecorder extends HttpRecorder[WSResponse] {

  val errorPrefix = "Error:"
  override def toResponse(b: Array[Byte]) = {
    val str = new String(b, UTF8.charSet)
    if (str.startsWith(errorPrefix)) {
      NingWSResponse(Response("", str.replace(errorPrefix, "").toInt))
    } else {
      NingWSResponse(Response(str, 200))
    }
  }

  override def fromResponse(response: WSResponse): Array[Byte] = {
    val strResponse = if (response.status == 200) {
      response.body
    } else {
      errorPrefix + response.status
    }
    strResponse.getBytes(UTF8.charSet)
  }

  private case class Response(getResponseBody: String, status: Int) extends AHCResponse {
    def getContentType: String = "application/json"
    def getResponseBody(charset: String): String = getResponseBody
    def getStatusCode: Int = status
    def getResponseBodyAsBytes: Array[Byte] = getResponseBody.getBytes
    def getResponseBodyAsByteBuffer: ByteBuffer = throw new NotImplementedError()
    def getResponseBodyAsStream: InputStream = throw new NotImplementedError()
    def getResponseBodyExcerpt(maxLength: Int, charset: String): String = throw new NotImplementedError()
    def getResponseBodyExcerpt(maxLength: Int): String = throw new NotImplementedError()
    def getStatusText: String = throw new NotImplementedError()
    def getUri: Uri = throw new NotImplementedError()
    def getHeader(name: String): String = throw new NotImplementedError()
    def getHeaders(name: String): util.List[String] = throw new NotImplementedError()
    def getHeaders: FluentCaseInsensitiveStringsMap = throw new NotImplementedError()
    def isRedirected: Boolean = throw new NotImplementedError()
    def getCookies = throw new NotImplementedError()
    def hasResponseStatus: Boolean = throw new NotImplementedError()
    def hasResponseHeaders: Boolean = throw new NotImplementedError()
    def hasResponseBody: Boolean = throw new NotImplementedError()
  }
}
