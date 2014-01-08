package model.abtests

import common.{ExecutionContexts, Logging}
import tools.CloudWatch
import views.support.JavaScriptVariableName

import scala.collection.JavaConverters._

object AbTestJob extends Logging with ExecutionContexts {
  def run() {

    log.info("Downloading abtests info from CloudWatch")

    CloudWatch.AbMetricNames map { result =>
      // Group variant names by test name
      val tests = result.getMetrics.asScala.map(_.getMetricName.split("-")).collect {
                    case Array(test: String, variant: String, _*) => (test, variant) }.groupBy(_._1).withDefaultValue(Nil)

      val switches = conf.Switches.all.filter(_.name.startsWith("ab-")).map(switch => JavaScriptVariableName(switch.name))

      val testVariants = switches.foldLeft(Map.empty[String, Seq[String]]) ( (acc, switch ) => {
        // Update map with a list of variants for the ab-test switch.
        acc.updated(switch, tests(switch).map(_._2))
      })

      AbTests.update(testVariants)
    }
  }
}
