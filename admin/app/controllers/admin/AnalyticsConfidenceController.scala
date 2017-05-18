package controllers.admin

import common.{ExecutionContexts, Logging}
import model.ApplicationContext
import play.api.mvc.{Action, AnyContent, Controller}
import tools._

class AnalyticsConfidenceController(implicit context: ApplicationContext) extends Controller with Logging with ExecutionContexts {
    def renderConfidence(): Action[AnyContent] = Action.async { implicit request =>
    for {
      ophan <- CloudWatch.ophanConfidence
      google <- CloudWatch.googleConfidence
    } yield {
      val ophanAverage = ophan.dataset.flatMap(_.values.headOption).sum / ophan.dataset.length
      val googleAverage = google.dataset.flatMap(_.values.headOption).sum / google.dataset.length

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

      Ok(views.html.lineCharts(Seq(ophanGraph, googleGraph)))
    }
  }
}
