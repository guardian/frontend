package rugby.controllers

import com.softwaremill.macwire._
import model.ApplicationContext
import play.api.mvc.ControllerComponents
import rugby.jobs.RugbyStatsJob

trait RugbyControllers {
  def rugbyStatsJob: RugbyStatsJob
  def controllerComponents: ControllerComponents
  implicit def appContext: ApplicationContext
  lazy val matchesController = wire[MatchesController]
}
