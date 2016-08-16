package test

import common.ExecutionContexts
import java.io.File

import football.controllers.HealthCheck
import org.scalatest.{BeforeAndAfterAll, Suites}
import recorder.{DefaultHttpRecorder, HttpRecorder}
import play.api.libs.ws.WSClient
import conf.FootballClient
import football.model._
import football.collections.RichListTest
import pa.{Http, Response => PaResponse}

import scala.concurrent.Future

class SportTestSuite extends Suites (
  new CompetitionListControllerTest,
  new FixturesControllerTest,
  new LeagueTableControllerTest,
  new MatchControllerTest,
  new MoreOnMatchFeatureTest,
  new RichListTest,
  new CompetitionStageTest,
  new FixturesListTest,
  new MatchDayListTest,
  new ResultsListTest,
  new TeamColoursTest,
  new CompetitionAgentTest,
  new FixturesFeatureTest,
  new LeagueTablesFeatureTest,
  new LiveMatchesFeatureTest,
  new MatchFeatureTest,
  new ResultsFeatureTest,
  new rugby.model.MatchParserTest
) with SingleServerSuite with BeforeAndAfterAll with WithTestWsClient {
  override lazy val port: Int = new HealthCheck(wsClient).testPort
}

trait WithTestFootballClient {
  self: WithTestFootballClient with WithTestWsClient =>

  lazy val testFootballClient = new FootballClient(wsClient) {
    override def GET(url: String): Future[PaResponse] = {
      FootballHttpRecorder.load(url) {
        val normalisedUrl = HttpRecorder.normalise("football", url)
        wsClient.url(normalisedUrl)
          .withRequestTimeout(10000)
          .get()
          .map { wsResponse =>
            pa.Response(wsResponse.status, wsResponse.body, wsResponse.statusText)
          }
      }
    }
  }

}

object FootballHttpRecorder extends HttpRecorder[PaResponse] {
  override lazy val baseDir = new File(s"${getClass.getClassLoader.getResource("testdata").getFile}/")

  def toResponse(str: String) = PaResponse(200, str, "ok")

  def fromResponse(response: PaResponse) = response.body
}
