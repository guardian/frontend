package conf

import com.gu.management.{ Switchable, TimingMetric, Healthcheck }
import common._

object Configuration extends Configuration("frontend-article", webappConfDirectory = "env")

object ContentApi extends ContentApi(Configuration)

object Switches {
  //  val switch = new DefaultSwitch("name", "Description Text")
  val all: Seq[Switchable] = List(Healthcheck.switch)
}

object Metrics {
  //  val metric = new TimingMetric("frontend-article", "name", "title", "Description Text")
  val all: Seq[TimingMetric] = Nil
}
