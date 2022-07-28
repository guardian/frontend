package model.abtests

import tools.{ABDataChart, ChartFormat, CloudWatch}
import com.amazonaws.services.cloudwatch.model.GetMetricStatisticsRequest
import org.joda.time.DateTime

import scala.concurrent.{ExecutionContext, Future}
import awswrappers.cloudwatch._
import common.Box

object AbTests {
  private val abTests = Box[Map[String, Seq[String]]](Map.empty)

  def getTests(): Map[String, Seq[String]] = {
    abTests.get()
  }

  def update(testVariants: Map[String, Seq[String]]): Unit = {
    abTests.send(testVariants)
  }

  case class AbChart(testId: String, variants: Seq[String])

  def getAbCharts()(implicit executionContext: ExecutionContext): Future[Seq[ABDataChart]] = {
    Future.traverse(getTests().keys.toSeq) { abTest =>
      val variants: Seq[String] = getTests()(abTest)

      for {
        cloudWatchResults <- Future.traverse(variants) { variant =>
          CloudWatch.euWestClient.getMetricStatisticsFuture(
            new GetMetricStatisticsRequest()
              .withStartTime(new DateTime().minusHours(6).toDate)
              .withEndTime(new DateTime().toDate)
              .withPeriod(360)
              .withStatistics("Average")
              .withNamespace("AbTests")
              .withMetricName(s"$abTest-$variant")
              .withDimensions(CloudWatch.stage),
          )
        }
      } yield new ABDataChart(abTest, Seq("Time") ++ variants, ChartFormat.MultiLine, cloudWatchResults: _*)
    }
  }
}
