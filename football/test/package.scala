package test

import feed.Competitions
import play.api.{ Application => PlayApplication }
import conf.{ FootballStatsPlugin, FootballClient, Configuration }
import pa.Http
import io.Source
import org.joda.time.DateMidnight
import scala.concurrent.{Await, Future}
import scala.concurrent.duration._
import play.api.test.TestBrowser
import play.api.libs.concurrent.Execution.Implicits._



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

    FootballClient.http = TestHttp

    override lazy val disabledPlugins = super.disabledPlugins ++ Seq(classOf[FootballStatsPlugin].getName)

    override def UK[T](path: String)(block: TestBrowser => T): T = {
      warmup()
      goTo(path, ukHost)(block)
    }

    override def US[T](path: String)(block: TestBrowser => T): T = {
      warmup()
      goTo(path, usHost)(block)
    }

    def warmup() = Fake{

      if (Competitions.matches.isEmpty) {
        await(Competitions.refreshCompetitionData())

        await(Competitions.refreshMatchDay())
        Competitions.competitionAgents.par.foreach{ agent =>
          // first await is to load live matches
          agent.await()

          val fixtures = agent.refreshFixtures()
          val results = agent.refreshResults()
          val table = agent.refreshLeagueTable()
          await(fixtures)
          await(results)
          await(table)

          // second await is everything else
          agent.await()
        }
      }
    }

    private def await[T](f: Future[T]) = Await.ready(f, 10.seconds)

  }
}