package test

import java.io.File
import conf.{FootballClient, SportConfiguration}
import football.collections.RichListTest
import football.containers.FixturesAndResultsTest
import football.model._
import org.scalatest.Suites
import pa.{Http, Response => PaResponse}
import play.api.libs.ws.WSClient
import recorder.{DefaultHttpRecorder, HttpRecorder}

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import scala.io.Codec.UTF8

class SportTestSuite
    extends Suites(
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
      new LeagueTablesFeatureTest,
      new MatchFeatureTest,
      new FixturesAndResultsTest,
    )
    with SingleServerSuite {}

trait WithTestFootballClient {
  self: WithTestExecutionContext =>

  def wsClient: WSClient

  lazy val testFootballClient = new FootballClient(wsClient) {
    override def GET(url: String): Future[PaResponse] = {
      FootballHttpRecorder
        .load(url.replace(SportConfiguration.pa.footballKey, "apikey")) {
          wsClient
            .url(url)
            .withRequestTimeout(10.seconds)
            .get()
            .map { wsResponse =>
              pa.Response(wsResponse.status, wsResponse.body, wsResponse.statusText)
            }
        }(testExecutionContext)
    }
  }

}

object FeedHttpRecorder extends DefaultHttpRecorder {
  override lazy val baseDir = new File(System.getProperty("user.dir"), "data/sportfeed")
}

// Stubs data for Football stats integration tests
class TestHttp(wsClient: WSClient)(implicit executionContext: ExecutionContext) extends Http {

  def GET(url: String): Future[PaResponse] = {
    val sanitisedUrl = url.replace(SportConfiguration.pa.footballKey, "apikey")
    FootballHttpRecorder.load(sanitisedUrl) {
      wsClient
        .url(url)
        .withRequestTimeout(10.seconds)
        .get()
        .map { wsResponse =>
          pa.Response(wsResponse.status, wsResponse.body, wsResponse.statusText)
        }
    }
  }
}

object FootballHttpRecorder extends HttpRecorder[PaResponse] {
  override lazy val baseDir = new File(System.getProperty("user.dir"), "data/football")

  override def toResponse(b: Array[Byte]): PaResponse = PaResponse(200, new String(b, UTF8.charSet), "ok")

  override def fromResponse(response: PaResponse): Array[Byte] = response.body.getBytes(UTF8.charSet)
}
