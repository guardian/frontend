package jobs

import common.{ExecutionContexts, Logging}
import org.joda.time.DateTime
import services.{CloudWatch, OphanApi}

import scala.collection.JavaConversions._
import scala.concurrent.Future
import scala.concurrent.Future.sequence

object AnalyticsSanityCheckJob extends ExecutionContexts with Logging {

  def run() {

    val rawPageViews = CloudWatch.rawPageViews.map(
      _.getDatapoints.headOption.map(_.getSum.doubleValue()).getOrElse(0.0)
    )

    val analyticsPageViews = CloudWatch.analyticsPageViews.map(
      _.getDatapoints.headOption.map(_.getSum.doubleValue()).getOrElse(0.0)
    )

    def sensible(what :Double) : Double = {
      if (what > 200) 200.0 else what
    }

    def pageViewComparison(eventualAnalytics: Future[Double]) = {
      sequence(Seq(rawPageViews, eventualAnalytics)).map {
        case (raw :: analytics :: Nil) => sensible(analytics / raw * 100)
      }
    }

    val omniture = pageViewComparison(analyticsPageViews)

    val ophan = pageViewComparison(ophanViews)

    val eventualAdConfidence = {
      val pageViewsHavingAnAd = CloudWatch.pageViewsHavingAnAd.map(
        _.getDatapoints.headOption.map(_.getSum.doubleValue()).getOrElse(0.0)
      )
      pageViewComparison(pageViewsHavingAnAd)
    }

    sequence(Seq(omniture, ophan, eventualAdConfidence)).foreach {
      case (omniture :: ophan :: adConfidence :: Nil) =>
      model.diagnostics.CloudWatch.put("Analytics", Map(
        "omniture-percent-conversion" -> omniture,
        "ophan-percent-conversion" -> ophan,
        "omniture-ophan-correlation" -> omniture / ophan * 100,
        "ad-confidence" -> adConfidence
      ))
    }
 }

  private def ophanViews = {
    val now = new DateTime().minusMinutes(15).getMillis
    OphanApi.getBreakdown("next-gen", hours = 1).map { json =>
      (json \\ "data").flatMap {
        line =>
          val recent = line.asInstanceOf[play.api.libs.json.JsArray].value.filter {
            entry =>
              (entry \ "dateTime").as[Long] > now
          }
          recent.map(r => (r \ "count").as[Long]).toSeq
      }.sum.toDouble
    }
  }
}
