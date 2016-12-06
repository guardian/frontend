package controllers.admin

import play.api.mvc.{Action, Controller}
import common.{ExecutionContexts, Logging}
import model.NoCache

import scala.concurrent.Future
import model.quality.QualityData
import play.api.Environment

class AnalyticsController(implicit env: Environment) extends Controller with Logging with ExecutionContexts {
  def abtests() = Action.async { implicit request =>
    Future(NoCache(Ok(views.html.abtests())))
  }

  def renderQuality() = Action.async { implicit request =>
      val charts = List("browsersTop25", "operatingSystemsTop25")
      val response = charts.map { chartName =>
        chartName -> QualityData.getReport(chartName).getOrElse("")
      }.toMap

      Future(NoCache(Ok(views.html.quality(response))))

  }

}
