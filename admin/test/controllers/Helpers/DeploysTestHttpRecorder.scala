package controllers.Helpers

import java.io.{File, InputStream}
import java.nio.ByteBuffer
import java.util
import com.ning.http.client.uri.Uri
import com.ning.http.client.{FluentCaseInsensitiveStringsMap, Response => ningResponse}
import play.api.libs.ws.WSResponse
import play.api.libs.ws.ning.NingWSResponse
import recorder.HttpRecorder

object DeploysTestHttpRecorder extends HttpRecorder[WSResponse] {
  override lazy val baseDir = new File(System.getProperty("user.dir"), "data/deploys")

  val errorPrefix = "Error:"
  def toResponse(str: String) = {
    if (str.startsWith(errorPrefix)) {
      NingWSResponse(Response("", str.replace(errorPrefix, "").toInt))
    } else {
      NingWSResponse(Response(str, 200))
    }
  }

  def fromResponse(response: WSResponse) = {
    if (response.status == 200) {
      response.body
    }
    else {
      errorPrefix + response.status
    }
  }
}

private case class Response(getResponseBody: String, status: Int) extends ningResponse {
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

