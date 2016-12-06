package controllers.admin

import common.{ExecutionContexts, Logging}
import play.api.Environment
import play.api.mvc.{Action, Controller}
import tools._

class AnalyticsConfidenceController(implicit env: Environment) extends Controller with Logging with ExecutionContexts {
  def renderConfidence() = Action.async { implicit request =>
    for {
      omniture <- CloudWatch.omnitureConfidence
      ophan <- CloudWatch.ophanConfidence
      google <- CloudWatch.googleConfidence
    } yield {
      val omnitureAverage = omniture.dataset.flatMap(_.values.headOption).sum / omniture.dataset.length
      val ophanAverage = ophan.dataset.flatMap(_.values.headOption).sum / ophan.dataset.length
      val googleAverage = google.dataset.flatMap(_.values.headOption).sum / google.dataset.length

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

      val googleGraph = new AwsLineChart("Google confidence", Seq("Time", "%", "avg."), ChartFormat(Colour.`tone-comment-1`, Colour.success)) {
        override lazy val dataset = google.dataset.map{ point =>
          point.copy(values =  point.values :+ googleAverage)
        }
      }

      Ok(views.html.lineCharts(Seq(omnitureGraph, ophanGraph, googleGraph)))
    }
  }
}
