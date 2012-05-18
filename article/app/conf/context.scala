package conf

import common._
import com.gu.management.{ Switchable, TimingMetric, Healthcheck }

object Configuration extends Configuration("frontend-article", webappConfDirectory = "env")

object TimedAction extends TimingAction("total",
  "total-time",
  "Total time",
  "Time spent serving requests")

object ContentApiHttpMetric extends TimingMetric("http",
  "content-api-calls",
  "Content API calls",
  "Time spent waiting for Content API")

object ContentApi extends ContentApi(Configuration, ContentApiHttpMetric)

object Static extends Static(Configuration.static.path)

object Switches {
  //  val switch = new DefaultSwitch("name", "Description Text")
  val all: Seq[Switchable] = List(Healthcheck.switch)
}

object Metrics {
  val all: Seq[TimingMetric] = Seq(ContentApiHttpMetric, TimedAction)
}
