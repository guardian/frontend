package controllers.admin

import play.api.mvc.Controller
import common.Logging
import tools._
import controllers.AuthLogging

object AnalyticsConfidenceController extends Controller with Logging with AuthLogging {

  def renderConfidence() = AuthActions.AuthActionTest { request =>
    val omniture = CloudWatch.omnitureConfidence
    val ophan = CloudWatch.ophanConfidence
    val ratio = CloudWatch.ratioConfidence

    val omnitureAverage = omniture.dataset.flatMap(_.values.headOption).sum / omniture.dataset.length
    val ophanAverage = ophan.dataset.flatMap(_.values.headOption).sum / ophan.dataset.length
    val ratioAverage = ratio.dataset.flatMap(_.values.headOption).sum / ratio.dataset.length

    val omnitureGraph = new AwsLineChart("Omniture confidence", Seq("Time", "%", "avg."),ChartFormat.DoubleLineBlueRed) {
      override lazy val dataset = omniture.dataset.map{ point =>
        point.copy(values =  point.values :+ omnitureAverage)
      }
    }

    val ophanGraph = new AwsLineChart("Ophan confidence", Seq("Time", "%", "avg."), ChartFormat.DoubleLineBlueRed) {
      override lazy val dataset = ophan.dataset.map{ point =>
        point.copy(values =  point.values :+ ophanAverage)
      }
    }

    val ratioGraph = new AwsLineChart("Omniture to Ophan confidence", Seq("Time", "%", "avg."), ChartFormat.DoubleLineBlueRed) {
      override lazy val dataset = ratio.dataset.map{ point =>
        point.copy(values =  point.values :+ ratioAverage)
      }
    }

    Ok(views.html.lineCharts("PROD", Seq(omnitureGraph, ophanGraph, ratioGraph)))
  }
}
