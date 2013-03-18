package test

import feed.Competitions
import play.api.{ Application => PlayApplication }
import conf.{ FootballStatsPlugin, FootballClient, Configuration }
import pa.Http
import io.Source
import play.api.Plugin
import org.joda.time.DateMidnight
import common._
import concurrent.Future

class StubFootballStatsPlugin(app: PlayApplication) extends Plugin with implicits.Football {
  override def onStart() = {
    FootballClient.http = TestHttp
    Competitions.refreshCompetitionData()
    Competitions.refreshMatchDay()
    Competitions.competitionAgents.filter(_.competition.id != "127").foreach { agent =>
      agent.refresh()
    }
    val start = System.currentTimeMillis()

    while (!testDataLoaded){
      //give the futures some time to do their thing

      //ensure we are not stuck in an endless loop if we mess up a test
      if (System.currentTimeMillis() - start > 10000) throw new RuntimeException("this is taking too long to load test data")
    }
  }

  private def testDataLoaded = {
    Competitions.withId("100").map(_.matches.exists(_.isFixture)).getOrElse(false) &&
    Competitions.withId("100").map(_.matches.exists(_.isResult)).getOrElse(false) &&
    Competitions.withId("100").map(_.matches.exists(_.isLive)).getOrElse(false) &&
    Competitions.withId("100").map(_.hasLeagueTable).getOrElse(false)
  }
}

// Stubs data for Football stats integration tests
object TestHttp extends Http {

  val today = new DateMidnight()

  val base = s"${getClass.getClassLoader.getResource("testdata").getFile}/"

  def GET(url: String) = {
    import play.api.libs.concurrent.Execution.Implicits._
    val fileName = {
      val file = base + (url.replace(Configuration.pa.apiKey, "APIKEY")
        .replace("http://pads6.pa-sport.com/", "")
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

object `package` {
  object HtmlUnit extends EditionalisedHtmlUnit {
    override lazy val testPlugins = super.testPlugins ++ Seq(classOf[StubFootballStatsPlugin].getName)
    override lazy val disabledPlugins = super.disabledPlugins ++ Seq(classOf[FootballStatsPlugin].getName)
  }

  object Fake extends Fake
}