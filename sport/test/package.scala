package test

import common.ExecutionContexts
import java.io.File

import football.controllers.HealthCheck
import org.scalatest.{BeforeAndAfterAll, Suites}
import recorder.{DefaultHttpRecorder, HttpRecorder}
import play.api.libs.ws.WSClient
import conf.FootballClient
import pa.{Http, Response => PaResponse}

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
) with SingleServerSuite with FootballTestData with BeforeAndAfterAll with WithTestWsClient {

  override lazy val port: Int = new HealthCheck(wsClient).testPort

  // Inject stub api.
  FootballClient.http = new TestHttp(wsClient)
  loadTestData()
}

object FeedHttpRecorder extends DefaultHttpRecorder {
  override lazy val baseDir = new File(System.getProperty("user.dir"), "data/sportfeed")
}

// Stubs data for Football stats integration tests
class TestHttp(wsClient: WSClient) extends Http with ExecutionContexts {

  def GET(url: String): Future[PaResponse] = {
    FootballHttpRecorder.load(url) {
      wsClient.url(url)
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
