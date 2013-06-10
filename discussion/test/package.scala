package test

import recorder.HttpRecorder
import com.ning.http.client.{Response => NingResponse, FluentCaseInsensitiveStringsMap, Cookie}
import play.api.libs.ws.Response
import java.util
import java.net.URI
import java.io.{File, InputStream}
import java.nio.ByteBuffer
import play.api.Plugin
import discussion.DiscussionApi
import common.ExecutionContexts

private case class Resp(getResponseBody: String) extends NingResponse {
  def getContentType: String = "application/json"
  def getResponseBody(charset: String): String = getResponseBody
  def getStatusCode: Int = 200



  def getResponseBodyAsBytes: Array[Byte] = throw new NotImplementedError()
  def getResponseBodyAsByteBuffer: ByteBuffer = throw new NotImplementedError()
  def getResponseBodyAsStream: InputStream = throw new NotImplementedError()
  def getResponseBodyExcerpt(maxLength: Int, charset: String): String = throw new NotImplementedError()
  def getResponseBodyExcerpt(maxLength: Int): String = throw new NotImplementedError()
  def getStatusText: String = throw new NotImplementedError()
  def getUri: URI = throw new NotImplementedError()
  def getHeader(name: String): String = throw new NotImplementedError()
  def getHeaders(name: String): util.List[String] = throw new NotImplementedError()
  def getHeaders: FluentCaseInsensitiveStringsMap = throw new NotImplementedError()
  def isRedirected: Boolean = throw new NotImplementedError()
  def getCookies: util.List[Cookie] = throw new NotImplementedError()
  def hasResponseStatus: Boolean = throw new NotImplementedError()
  def hasResponseHeaders: Boolean = throw new NotImplementedError()
  def hasResponseBody: Boolean = throw new NotImplementedError()

}

object DiscussionApiHttpRecorder extends HttpRecorder[Response] {

  override lazy val baseDir = new File(System.getProperty("user.dir"), "data/discussion")

  def toResponse(str: String) = Response(Resp(str))

  def fromResponse(response: Response) = {
    if (response.status == 200) {
      response.body
    } else {
      s"Error:${response.status}"
    }
  }
}

class DiscussionStubPlugin(val app: play.api.Application) extends Plugin with ExecutionContexts {


  override def onStart() {
    val http = DiscussionApi.http
    DiscussionApi.http = url => DiscussionApiHttpRecorder.load(url, Map.empty){
      http(url)
    }

    super.onStart()
  }
}

object `package` {
  object HtmlUnit extends EditionalisedHtmlUnit
  object Fake extends FakeApp {
    override def testPlugins = super.testPlugins :+ classOf[DiscussionStubPlugin].getName
  }
}