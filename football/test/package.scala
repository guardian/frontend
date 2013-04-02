package test

import feed.Competitions
import play.api.{ Application => PlayApplication }
import conf.{ FootballStatsPlugin, FootballClient, Configuration }
import pa.Http
import io.Source
import play.api.Plugin
import org.joda.time.DateMidnight
import concurrent.Future
import play.api.test.TestBrowser
import play.api.libs.concurrent.Execution.Implicits._


class StubFootballStatsPlugin(app: PlayApplication) extends Plugin {
  override def onStart() = {
    FootballClient.http = TestHttp
    Competitions.refreshCompetitionData()
    Competitions.refreshMatchDay()
    Competitions.competitionAgents.filter(_.competition.id != "127").foreach{ agent =>
      agent.refresh()
    }
  }
}

// Stubs data for Football stats integration tests
object TestHttp extends Http {

  val today = new DateMidnight()

  val base = s"${getClass.getClassLoader.getResource("testdata").getFile}/"

  def GET(url: String) = {

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
  object HtmlUnit extends EditionalisedHtmlUnit with implicits.Football {
    override lazy val testPlugins = super.testPlugins ++ Seq(classOf[StubFootballStatsPlugin].getName)
    override lazy val disabledPlugins = super.disabledPlugins ++ Seq(classOf[FootballStatsPlugin].getName)

    override def UK[T](path: String)(block: TestBrowser => T): T = {
      warmup()
      goTo(path, ukHost)(block)
    }

    override def US[T](path: String)(block: TestBrowser => T): T = {
      warmup()
      goTo(path, usHost)(block)
    }

    // You do not want this (it is effectively blocking) inside the football plugin
    def warmup() {

      super.UK("/football/live"){ browser =>
        // do nothing
      }

      val start = System.currentTimeMillis()

      while (!testDataLoaded()){
        Thread.sleep(100)
        //give the futures some time to do their thing
        //ensure we are not stuck in an endless loop if we mess up a test
        if (System.currentTimeMillis() - start > 10000) throw new RuntimeException("this is taking too long to load test data")
      }
    }

    //ensures that the data needed to run our tests has loaded
    // it is all async
    private def testDataLoaded() = {
      Competitions.withId("100").map(_.matches.exists(_.isFixture)).getOrElse(false) &&
      Competitions.withId("100").map(_.matches.exists(_.isResult)).getOrElse(false) &&
      Competitions.withId("100").map(_.matches.exists(_.isLive)).getOrElse(false) &&
      Competitions.withId("100").map(_.hasLeagueTable).getOrElse(false) &&
      Competitions.matchDates.exists(_ == new DateMidnight(2012, 10, 15))
    }
  }

  object Fake extends Fake
}