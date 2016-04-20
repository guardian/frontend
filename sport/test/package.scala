package test

import com.ning.http.client.FluentCaseInsensitiveStringsMap
import com.ning.http.client.uri.Uri;
import common.ExecutionContexts
import java.io.{File, InputStream}
import java.nio.ByteBuffer
import java.net.URI
import java.util
import org.scalatest.Suites
import play.api.libs.ws.ning.NingWSResponse
import recorder.HttpRecorder
import play.api.libs.ws.WSResponse
import play.api.{Application => PlayApplication}
import conf.{SportConfiguration, FootballClient, Configuration}
import pa.Http
import io.Source
import org.joda.time.LocalDate
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
  new services.SportHealthcheckTest,
  new CompetitionAgentTest,
  new FixturesFeatureTest,
  new LeagueTablesFeatureTest,
  new LiveMatchesFeatureTest,
  new MatchFeatureTest,
  new ResultsFeatureTest,
  new rugby.model.MatchParserTest
) with SingleServerSuite with FootballTestData {

  override lazy val port: Int = conf.HealthCheck.testPort

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

  val today = new LocalDate()

  val base = s"${getClass.getClassLoader.getResource("testdata").getFile}/"

  def GET(url: String) = {

    val fileName = {
      val file = base + (url.replace(SportConfiguration.pa.apiKey, "APIKEY")
        .replace(s"${SportConfiguration.pa.host}/", "")
        .replace("/", "__"))
      // spoof todays date
      file.replace(today.toString("yyyyMMdd"), "20121020")
    }

    try {
      // spoof todays date
      val xml = Source.fromFile(fileName).getLines.mkString.replace("20/10/2012", today.toString("dd/MM/yyyy"))
      Future(pa.Response(200, xml, "ok"))
    } catch {
      case t: Throwable => Future(pa.Response(404, "not found", "not found"))
    }
  }
}
