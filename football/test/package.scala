package test

import conf.{ FootballClient, Configuration }
import feed.Competitions
import pa.Http
import io.Source
import play.api.Plugin

class TestDependencies(app: play.api.Application) extends Plugin {
  override def onStart() = {
    FootballClient.setHttp(TestHttp)
    Competitions.refresh()
    Competitions.warmup()

    // yep, do this twice for tests (ain't concurrency lovely)
    Competitions.refresh()
    Competitions.warmup()
  }
}

object TestHttp extends Http {

  val base = getClass.getClassLoader.getResource("testdata").getFile + "/__"

  def GET(url: String) = {
    val fileName = base + (url.replace(Configuration.pa.apiKey, "test-key")
      .replace("http://pads6.pa-sport.com/", "")
      .replace("/", "__"))

    val xml = Source.fromFile(fileName).getLines.mkString

    pa.Response(200, xml, "ok")
  }
}

object `package` {
  object HtmlUnit extends EditionalisedHtmlUnit(Configuration) {
    override val testPlugins = Seq(classOf[TestDependencies].getName)
  }
}