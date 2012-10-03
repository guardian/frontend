package conf

import play.api.Play
import play.api.Play.current
import common._
import com.gu.management._
import com.gu.management.play._
import logback.LogbackLevelPage
import pa.{ Proxy, DispatchHttp, PaClient }
import io.Source
import java.net.URI

object Configuration extends GuardianConfiguration("frontend-football", webappConfDirectory = "env") {

  object pa {
    lazy val apiKey = configuration.getStringProperty("pa.api.key")
      .getOrElse(throw new RuntimeException("unable to load pa api key"))
  }

}

object ContentApi extends ContentApiClient(Configuration)

object FootballClient extends PaClient with TestAwareHttp {

  override lazy val maxConnections = 50

  override lazy val requestTimeoutInMs = 5000

  override lazy val proxy = if (Configuration.proxy.isDefined)
    Some(Proxy(Configuration.proxy.host, Configuration.proxy.port))
  else
    None

  lazy val apiKey = Configuration.pa.apiKey
}

object Static extends StaticAssets(Configuration.static.path)

object Switches {
  val all: Seq[Switchable] = List(Healthcheck.switch)
}

object Metrics {
  val all: Seq[Metric] = ContentApi.metrics.all ++ CommonMetrics.all
}

object Management extends Management {
  val applicationName = Configuration.application

  lazy val pages = List(
    new ManifestPage,
    new HealthcheckManagementPage,
    new Switchboard(Switches.all, applicationName),
    StatusPage(applicationName, Metrics.all),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}

sealed trait TestAwareHttp extends DispatchHttp { self: PaClient =>

  private lazy val isTest = Play.isTest

  override def GET(url: String) = {

    //it is either this or dependency injection
    if (isTest) {
      val fileName = "testdata/" + (url.replace(apiKey, "test-key").replace(base, "").replace("/", "__"))
      val file = getClass.getClassLoader.getResource(fileName)
      val xml = Source.fromFile(file.toURI).getLines.mkString
      pa.Response(200, xml, "ok")
    } else {
      super.GET(url)
    }
  }

}
