package test

import feed.Competitions
import play.api.{ Application => PlayApplication }
import conf.{ FootballStatsPlugin, FootballClient, Configuration }
import pa.Http
import io.Source
import play.api.Plugin
import org.joda.time.DateMidnight

class StubFootballStatsPlugin(app: PlayApplication) extends Plugin {
  override def onStart() = {
    FootballClient.http = TestHttp
    Competitions.refreshCompetitionData()
    Competitions.refreshMatchDay()

    //limit calls to the set of competitions we have test data for
    Competitions.competitionAgents.filter(agent => Seq("100", "101", "102", "103").contains(agent.competition.id)).
      foreach(Competitions.refreshAgent)
  }

  override def onStop() = {
    Competitions.shutDown()
  }
}

// Stubs data for Football stats integration tests
object TestHttp extends Http {

  val today = new DateMidnight().toString("dd/MM/yyyy")

  val base = getClass.getClassLoader.getResource("testdata").getFile + "/__"

  def GET(url: String) = {
    val fileName = {
      val tmp = base + (url.replace(Configuration.pa.apiKey, "test-key")
        .replace("http://pads6.pa-sport.com/", "")
        .replace("/", "__"))
      if (tmp.contains("competitions__matchDay")) base + "api__football__competitions__matchDay__test-key__20120905"
      else tmp
    }

    //mess with the live matches date so it thinks the match is live
    val xml = Source.fromFile(fileName).getLines.mkString.replace("05/09/2012", today)

    pa.Response(200, xml, "ok")
  }
}

object `package` {
  object HtmlUnit extends EditionalisedHtmlUnit(Configuration) {
    override val testPlugins = Seq(classOf[StubFootballStatsPlugin].getName)
    override val disabledPlugins = Seq(classOf[FootballStatsPlugin].getName)
  }
}