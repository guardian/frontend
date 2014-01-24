package controllers.admin

import play.api.mvc.Controller
import common.Logging
import tools._
import controllers.AuthLogging

object AnalyticsConfidenceController extends Controller with Logging with AuthLogging {

  def renderConfidence() = Authenticated { request =>
    val omniture = CloudWatch.omnitureConfidence
    val ophan = CloudWatch.ophanConfidence
    val ratio = CloudWatch.ratioConfidence

    val omnitureAverage = omniture.dataset.flatMap(_.values.headOption).sum / omniture.dataset.length
    val ophanAverage = ophan.dataset.flatMap(_.values.headOption).sum / omniture.dataset.length
    val ratioAverage = ratio.dataset.flatMap(_.values.headOption).sum / omniture.dataset.length

    val omnitureGraph = new LineChart("Omniture confidence", Seq("Time", "%", "avg.")) {
      override lazy val dataset = omniture.dataset.map{ point =>
        point.copy(values =  point.values :+ omnitureAverage)
      }

      override lazy val format = ChartFormat.DoubleLineBlueRed
    }

    val ophanGraph = new LineChart("Ophan confidence", Seq("Time", "%", "avg.")) {
      override lazy val dataset = ophan.dataset.map{ point =>
        point.copy(values =  point.values :+ ophanAverage)
      }

      override lazy val format = ChartFormat.DoubleLineBlueRed
    }

    val ratioGraph = new LineChart("Omniture to Ophan confidence", Seq("Time", "%", "avg.")) {
      override lazy val dataset = ratio.dataset.map{ point =>
        point.copy(values =  point.values :+ ratioAverage)
      }

      override lazy val format = ChartFormat.DoubleLineBlueRed
    }


    Ok(views.html.lineCharts("PROD", Seq(omnitureGraph, ophanGraph, ratioGraph)))
  }
}
