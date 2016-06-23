package test

import com.ning.http.client.FluentCaseInsensitiveStringsMap
import com.ning.http.client.uri.Uri
import common.ExecutionContexts
import java.io.{File, InputStream}
import java.nio.ByteBuffer
import java.util

import football.controllers.HealthCheck
import org.scalatest.Suites
import play.api.libs.ws.ning.NingWSResponse
import recorder.HttpRecorder
import play.api.libs.ws.{WS, WSResponse}
import conf.FootballClient
import pa.{Http, Response => PaResponse}
import play.api.Play.current

import scala.concurrent.Future

class SportTestSuite extends Suites (
  new CompetitionListControllerTest,
  new FixturesControllerTest,
  new LeagueTableControllerTest,
  new MatchControllerTest,
  new MoreOnMatchFeatureTest,
  new football.collections.RichListTest,
  new football.model.CompetitionStageTest,
  new football.model.FixturesListTest,
  new football.model.MatchDayListTest,
  new football.model.ResultsListTest,
  new football.model.TeamColoursTest,
  new CompetitionAgentTest,
  new FixturesFeatureTest,
  new LeagueTablesFeatureTest,
  new LiveMatchesFeatureTest,
  new MatchFeatureTest,
  new ResultsFeatureTest,
  new rugby.model.MatchParserTest
) with SingleServerSuite with FootballTestData {

  override lazy val port: Int = HealthCheck.testPort

  // Inject stub api.
  FootballClient.http = TestHttp
  loadTestData()
}

private case class Resp(getResponseBody: String) extends com.ning.http.client.Response {
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

object FeedHttpRecorder extends HttpRecorder[WSResponse] {

  override lazy val baseDir = new File(System.getProperty("user.dir"), "data/sportfeed")

  def toResponse(str: String) = NingWSResponse(Resp(str))

  def fromResponse(response: WSResponse) = {
    if (response.status == 200) {
      response.body
    } else {
      s"Error:${response.status}"
    }
  }
}

// Stubs data for Football stats integration tests
object TestHttp extends Http with ExecutionContexts {

  def GET(url: String): Future[PaResponse] = {
    FootballHttpRecorder.load(url) {
      WS.url(url)
        .withRequestTimeout(10000)
        .get()
        .map { wsResponse =>
          pa.Response(wsResponse.status, wsResponse.body, wsResponse.statusText)
        }
    }
  }
}

object FootballHttpRecorder extends HttpRecorder[PaResponse] {
  override lazy val baseDir = new File(s"${getClass.getClassLoader.getResource("testdata").getFile}/")

  def toResponse(str: String) = PaResponse(200, str, "ok")

  def fromResponse(response: PaResponse) = response.body
}
