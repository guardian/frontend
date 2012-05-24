package conf

import common._
import com.gu.management.{ Metric, Switchable, Healthcheck }

object Configuration extends Configuration("frontend-article", webappConfDirectory = "env")

object ContentApi extends ContentApiClient(Configuration)

object Static extends Static(Configuration.static.path)

object Switches {
  //  val switch = new DefaultSwitch("name", "Description Text")
  val all: Seq[Switchable] = List(Healthcheck.switch)
}

object Metrics {
  val all: Seq[Metric] = CommonMetrics.all
}
