package test

import feed.Competitions
import play.api.{ Application => PlayApplication }
import conf.{ FootballStatsPlugin, FootballClient, Configuration }
import pa.Http
import io.Source
import play.api.Plugin
import org.joda.time.DateMidnight
import common._

class StubFootballStatsPlugin(app: PlayApplication) extends Plugin {
  override def onStart() = {
    FootballClient.http = TestHttp
    Competitions.refreshCompetitionData()
    Competitions.refreshMatchDay()
    Competitions.competitionAgents.filter(_.competition.id != "127").foreach { agent =>
      agent.refresh()
      agent.await()
    }

    Competitions.shutDown()
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

    // spoof todays date
    val xml = Source.fromFile(fileName).getLines.mkString.replace("20/10/2012", today.toString("dd/MM/yyyy"))

    pa.Response(200, xml, "ok")
  }
}

object `package` {
  object HtmlUnit extends EditionalisedHtmlUnit {
    override lazy val testPlugins = super.testPlugins ++ Seq(classOf[StubFootballStatsPlugin].getName)
    override lazy val disabledPlugins = super.disabledPlugins ++ Seq(classOf[FootballStatsPlugin].getName)
  }

  object Fake extends Fake
}