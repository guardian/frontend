package jobs

import com.amazonaws.services.cloudwatch.model.GetMetricStatisticsResult
import common.{ExecutionContexts, Logging}
import services.CloudWatch

import scala.collection.JavaConversions._
import scala.concurrent.Future.sequence

object VideoSanityCheckJob extends ExecutionContexts with Logging {

  def run() {
    val videoPageViews = CloudWatch.videoPageViews.map(sanitise)
    val videoStarts = CloudWatch.videoStarts.map(sanitise)
    val videoEnds = CloudWatch.videoEnds.map(sanitise)
    val prerollStarts = CloudWatch.videoPrerollStarts.map(sanitise)
    val prerollEnds = CloudWatch.videoPrerollEnds.map(sanitise)

    val videoStartsConfidence = sequence(Seq(videoPageViews, videoStarts)).map{
      case (raw :: starts:: Nil) => starts / raw * 100
    }

    val videoEndsConfidence = sequence(Seq(videoPageViews, videoEnds)).map{
      case (raw :: ends:: Nil) => ends / raw * 100
    }

    val prerollStartsConfidence = sequence(Seq(videoPageViews, prerollStarts)).map{
      case (raw :: starts:: Nil) => starts / raw * 100
    }

    val prerollEndsConfidence = sequence(Seq(videoPageViews, prerollEnds)).map{
      case (raw :: ends:: Nil) => ends / raw * 100
    }

    sequence(Seq(videoStartsConfidence, videoEndsConfidence, prerollStartsConfidence, prerollEndsConfidence)).foreach{
      case (videoStarts :: videoEnds :: prerollStarts :: prerollEnds :: Nil) =>
        model.diagnostics.CloudWatch.put("VideoAnalytics", Map(
          "video-starts-confidence" -> videoStarts,
          "video-ends-confidence" -> videoEnds,
          "video-preroll-starts-confidence" -> prerollStarts,
          "video-preroll-ends-confidence" -> prerollEnds
        ))
    }
 }

  private def sanitise(result: GetMetricStatisticsResult) =
    result.getDatapoints.headOption.map(_.getSum.doubleValue()).getOrElse(0.0)
}
