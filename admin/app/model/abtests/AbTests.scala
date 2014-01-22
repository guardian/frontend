package model.abtests

import tools.{ChartFormat, CloudWatch, LineChart}
import com.amazonaws.services.cloudwatch.model.GetMetricStatisticsRequest
import org.joda.time.DateTime

object AbTests {

  private val abTests = common.AkkaAgent[Map[String, Seq[String]]](Map.empty)
  
  def getTests(): Map[String, Seq[String]] = {
      abTests.get
  }

  def update(testVariants: Map[String, Seq[String]]){
      abTests.send(testVariants)
  }

  case class AbChart(testId: String, variants: Seq[String])

  def getAbCharts(): Seq[LineChart] = {
    val abTests = getTests()

    abTests.keys.map { abTest =>
        val variants = abTests(abTest)

        val cloudwatchResults = variants.map { variant =>
          CloudWatch.euWestClient.getMetricStatisticsAsync( new GetMetricStatisticsRequest()
            .withStartTime(new DateTime().minusHours(6).toDate)
            .withEndTime(new DateTime().toDate)
            .withPeriod(360)
            .withStatistics("Average")
            .withNamespace("AbTests")
            .withMetricName(s"$abTest-$variant")
            .withDimensions(CloudWatch.stage),
            CloudWatch.asyncHandler)
        }

        // Make a list of line charts
        new LineChart(abTest, Seq("Time") ++ variants, cloudwatchResults:_*).withFormat(ChartFormat.MultiLine)
    }.toSeq
  }
} 
