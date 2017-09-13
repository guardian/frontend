package model.abtests

import common.Logging
import tools.CloudWatch
import views.support.CamelCase

import scala.collection.JavaConverters._
import scala.concurrent.ExecutionContext

object AbTestJob extends Logging {
  def run()(implicit executionContext: ExecutionContext) {

    log.info("Downloading abtests info from CloudWatch")

    CloudWatch.AbMetricNames() map { result =>
      // Group variant names by test name
      val tests = result.getMetrics.asScala.map(_.getMetricName.split("-").toList).collect {
                    case test :: variant => (test, variant.mkString("-")) }.groupBy(_._1)

      val switches = conf.switches.Switches.all.filter(_.name.startsWith("ab-")).map(switch => CamelCase.fromHyphenated(switch.name))

      val testVariants = switches.foldLeft(Map.empty[String, Seq[String]]) ( (acc, switch ) => {
        if (tests.isDefinedAt(switch)) {
          // Update map with a list of variants for the ab-test switch.
          acc.updated(switch, tests(switch).map(_._2))
        } else {
          acc
        }
      })

      AbTests.update(testVariants)
    }
  }
}
