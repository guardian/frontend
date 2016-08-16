package recorder

import java.io._
import java.net.URI
import java.nio.ByteBuffer
import java.util

import common.ExecutionContexts
import conf.Configuration
import com.ning.http.client.uri.Uri
import com.ning.http.client.{FluentCaseInsensitiveStringsMap, Response => AHCResponse}
import org.apache.commons.codec.digest.DigestUtils
import play.api.libs.ws.WSResponse
import play.api.libs.ws.ning.NingWSResponse

import scala.concurrent.Future
import scala.io.Source

object HttpRecorder {

  def normalise(key: String, url: String) = {
    // need to only use the relevant parts of the url
    val uri = URI.create(url)
    key + ":" + uri.getPath + uri.getQuery
  }

}

trait HttpRecorder[A] extends ExecutionContexts {

  def baseDir: File

  final def load(url: String, headers: Map[String, String] = Map.empty)(fetch: => Future[A]): Future[A] =
    loadFile(url, headers)(fetch).map(file => toResponse(contentFromFile(file)))


  // loads api call from disk. if it cannot be found on disk go get it and save to disk
  final def loadFile(url: String, headers: Map[String, String] = Map.empty)(fetch: => Future[A]): Future[File] = {

    val fileName = name(url, headers)

    // integration test environment
    // make sure people have checked in test files
    if (Configuration.environment.stage.equalsIgnoreCase("DEVINFRA") && !new File(baseDir, fileName).exists()) {
      throw new IllegalStateException(s"Data file has not been checked in for: $url, file: $fileName, headers: ${headersFormat(headers)}")
    }

    get(fileName)
      .map(Future(_))
      .getOrElse {
        fetch.map(r => put(fileName, fromResponse(r)))
      }
  }

  if (!baseDir.exists()) {
    baseDir.mkdirs()
    baseDir.mkdir()
  }

  private def put(name: String, value: String): File = {
    val file = new File(baseDir, name)
    val out = new OutputStreamWriter(new FileOutputStream(file), "UTF-8")
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

  private def contentFromFile(file: File): String = Source.fromFile(file, "UTF-8").getLines().mkString

  def toResponse(str: String): A

  def fromResponse(response: A): String

  private def headersFormat(headers: Map[String, String]): String = {
    headers.map{ case (key, value) => key + value }.mkString
  }

  private [recorder] def name(url: String, headers: Map[String, String]): String = {
    val headersString = headersFormat(headers)
    DigestUtils.sha256Hex(url +  headersString)
  }

  def fileLocation(url: String, headers: Map[String, String] = Map.empty): String = {
    new File(baseDir, name(url, headers)).getAbsolutePath
  }
}

trait DefaultHttpRecorder extends HttpRecorder[WSResponse] {

  val errorPrefix = "Error:"
  override def toResponse(str: String) = {
    if (str.startsWith(errorPrefix)) {
      NingWSResponse(Response("", str.replace(errorPrefix, "").toInt))
    } else {
      NingWSResponse(Response(str, 200))
    }
  }

  override def fromResponse(response: WSResponse) = {
    if (response.status == 200) {
      response.body
    } else {
      errorPrefix + response.status
    }
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
