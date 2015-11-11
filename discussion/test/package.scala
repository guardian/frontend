package test

import org.scalatest.Suites
import play.api.libs.ws.ning.NingWSResponse
import recorder.HttpRecorder
import com.ning.http.client.{Response => NingResponse, FluentCaseInsensitiveStringsMap}
import com.ning.http.client.uri.Uri;
import play.api.libs.ws.{WS, WSResponse}
import play.api.Application
import java.util
import java.net.URI
import java.io.{File, InputStream}
import java.nio.ByteBuffer
import play.api.Plugin
import discussion.DiscussionApi

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

object DiscussionApiHttpRecorder extends HttpRecorder[WSResponse] {

  override lazy val baseDir = new File(System.getProperty("user.dir"), "data/discussion")

  def toResponse(str: String) = NingWSResponse(Resp(str))

  def fromResponse(response: WSResponse) = {
    if (response.status == 200) {
      response.body
    } else {
      s"Error:${response.status}"
    }
  }
}

class DiscussionApiStub extends DiscussionApi {
  import play.api.Play.current
  protected val clientHeaderValue: String =""
  protected val apiRoot = conf.Configuration.discussion.secureApiRoot
  protected val apiTimeout = conf.Configuration.discussion.apiTimeout

  override protected def GET(url: String, headers: (String, String)*) = DiscussionApiHttpRecorder.load(url, Map.empty){
    WS.url(url).withRequestTimeout(2000).get()
  }
}

class DiscussionTestSuite extends Suites (
  new services.DiscussionHealthcheckTest,
  new CommentPageControllerTest,
  new controllers.DiscussionApiPluginIntegrationTest,
  new controllers.ProfileActivityControllerTest,
  new discussion.model.CommentTest,
  new discussion.model.DiscussionKeyTest,
  new discussion.DiscussionApiTest,
  new CommentCountControllerTest,
  new ProfileTest
  ) with SingleServerSuite {
  override lazy val port: Int = conf.HealthCheck.testPort

  // Inject stub api.
  controllers.delegate.api = new DiscussionApiStub()
}
