package test

import play.api.{Application => PlayApplication, Plugin}
import conf.{FootballClient, FootballStatsPlugin, Configuration}
import pa.Http
import io.Source
import org.joda.time.DateMidnight
import scala.concurrent.Future
import common.ExecutionContexts


class StubFootballStatsPlugin(app: PlayApplication) extends Plugin with FootballTestData {
  override def onStart() {
    FootballClient.http = TestHttp
    loadTestData()
  }
}

// Stubs data for Football stats integration tests
object TestHttp extends Http with ExecutionContexts {

  val today = new DateMidnight()

  val base = s"${getClass.getClassLoader.getResource("testdata").getFile}/"

  def GET(url: String) = {

    val fileName = {
      val file = base + (url.replace(Configuration.pa.apiKey, "APIKEY")
        .replace(s"${Configuration.pa.host}/", "")
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

object Fake extends FakeApp {
  override lazy val testPlugins = super.testPlugins ++ Seq(classOf[StubFootballStatsPlugin].getName)
  override lazy val disabledPlugins = super.disabledPlugins ++ Seq(classOf[FootballStatsPlugin].getName)
}
