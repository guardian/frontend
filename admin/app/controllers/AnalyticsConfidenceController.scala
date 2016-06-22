package controllers.admin

import play.api.mvc.Controller
import common.{ExecutionContexts, Logging}
import tools._
import controllers.AuthLogging

class AnalyticsConfidenceController extends Controller with Logging with AuthLogging with ExecutionContexts {
  def renderConfidence() = AuthActions.AuthActionTest.async { implicit request =>
    for {
      omniture <- CloudWatch.omnitureConfidence
      ophan <- CloudWatch.ophanConfidence
    } yield {
      val omnitureAverage = omniture.dataset.flatMap(_.values.headOption).sum / omniture.dataset.length
      val ophanAverage = ophan.dataset.flatMap(_.values.headOption).sum / ophan.dataset.length

      val omnitureGraph = new AwsLineChart("Omniture confidence", Seq("Time", "%", "avg."), ChartFormat(Colour.`tone-comment-2`, Colour.success)) {
        override lazy val dataset = omniture.dataset.map{ point =>
          point.copy(values =  point.values :+ omnitureAverage)
        }
      }

      val ophanGraph = new AwsLineChart("Ophan confidence", Seq("Time", "%", "avg."), ChartFormat(Colour.`tone-comment-1`, Colour.success)) {
        override lazy val dataset = ophan.dataset.map{ point =>
          point.copy(values =  point.values :+ ophanAverage)
        }
      }

      Ok(views.html.lineCharts("PROD", Seq(omnitureGraph, ophanGraph)))
    }
  }
}
