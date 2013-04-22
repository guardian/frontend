package test

import feed.Competitions
import play.api.{Application => PlayApplication, Plugin}
import conf.{FootballStatsPlugin, Configuration}
import pa.{Result, Fixture, MatchDay, Http}
import io.Source
import org.joda.time.DateMidnight
import scala.concurrent.Future
import play.api.libs.concurrent.Execution.Implicits._




class StubFootballStatsPlugin(app: PlayApplication) extends Plugin with FootballTestData {
  override def onStart() = {

    if (Competitions.matches.isEmpty) {
      if (Competitions.matches.isEmpty) {
        Competitions.competitionAgents.flatMap { agent =>
          competitions.filter(_.id == agent.competition.id).flatMap{ comp =>
            Seq(
              agent.update(comp),
              agent.updateLiveMatches(comp.matches.filter(_.isInstanceOf[MatchDay]).map(_.asInstanceOf[MatchDay])),
              agent.updateFixtures(comp.matches.filter(_.isInstanceOf[Fixture]).map(_.asInstanceOf[Fixture])),
              agent.updateResults(comp.matches.filter(_.isInstanceOf[Result]))
            )
          }
        }
      }
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
  }
}