package conf

import _root_.play.api.{ Application => PlayApp }
import common._
import com.gu.management._
import com.gu.management.play.{ Management => GuManagement }

import com.gu.management.logback.LogbackLevelPage

object Switches {
  val all: Seq[Switchable] = CommonSwitches.all
}

class SwitchBoardPlugin(app: PlayApp) extends SwitchBoardAgent(Configuration, Switches.all)

object MongoTimingMetric extends TimingMetric("performance", "database", "Mongo request", "outgoing Mongo calls")
object MongoOkCount extends CountMetric("database-status", "ok", "Ok", "number of mongo requests successfully completed")
object MongoErrorCount extends CountMetric("database-status", "error", "Error", "number of mongo requests that error")

object Metrics {
  val all: Seq[Metric] = ContentApiMetrics.all ++ CommonMetrics.all ++ Seq(MongoTimingMetric, MongoOkCount, MongoErrorCount)
}

object Management extends GuManagement {
  val applicationName = "frontend-event"

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(
      "/stories"
    ), 
    StatusPage(applicationName, Metrics.all),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
