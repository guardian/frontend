package test

import java.io.{File, InputStream, OutputStream}
import java.nio.ByteBuffer
import java.util

import com.ning.http.client.uri.Uri
import com.ning.http.client.{FluentCaseInsensitiveStringsMap, Response}
import org.scalatest.{BeforeAndAfterAll, FlatSpec, Matchers}
import play.api.libs.ws.WSResponse
import play.api.libs.ws.ning.NingWSResponse
import recorder.HttpRecorder

import scala.sys.process._


trait AmpValidityTest extends FlatSpec with Matchers with ConfiguredTestSuite with BeforeAndAfterAll with WithTestWsClient {

  val VALIDATOR_URI = "https://cdn.ampproject.org/v0/validator.js"

  /**
    * Passes the result of hitting the given url to the amphtml-validator.
    * @param url url of the amp page to validate - the amp query string parameter need not be included
    */
  def testAmpPageValidity(url: String): Unit = {
    val ampUrl = ampifyUrl(url)

    s"The AMP page at $url" should "pass an AMP validator" in getContentString(ampUrl) { content =>

      val commandInputWriter: OutputStream => Unit = writeToProcess(content)

      // The process fails when not using stdout/stderr, but these may prove useful for debugging anyway
      val io = new ProcessIO(commandInputWriter, BasicIO.toStdOut, BasicIO.toStdErr)

      // Pass the content to the command line tool (external process) via stdin ('-' option)
      val process = s"node_modules/.bin/amphtml-validator --validator_js ${fetchValidator()} -".run(io)

      withClue("AMP validator should complete with exit value 0, the actual exit value of ") {
        process.exitValue() should be(0)
      }
    }
  }

  private def fetchValidator(): String = {
    recorder.load(VALIDATOR_URI) {
      wsClient.url(VALIDATOR_URI).get()
    }
    recorder.fileLocation(VALIDATOR_URI)
  }

  private def writeToProcess(str: String)(out: OutputStream): Unit = {
    out.write(str.getBytes)
    out.close()
  }

  // This is too simplistic, but all we need for now.
  // It should be replaced if support for urls with existing params is needed.
  private def ampifyUrl(url: String): String = {
    url + "?amp"
  }

  val recorder = new HttpRecorder[WSResponse] {
    override lazy val baseDir = new File(System.getProperty("user.dir"), "data/amp-validator")

    def toResponse(str: String) = NingWSResponse(Resp(str, 200))

    def fromResponse(response: WSResponse) = {
      if (response.status == 200) {
        response.body
      } else {
        s"Error:${response.status}"
      }
    }
  }

  private case class Resp(getResponseBody: String, status: Int) extends Response {
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
