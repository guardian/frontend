package cricket.controllers

import com.softwaremill.macwire._
import jobs.CricketStatsJob
import model.ApplicationContext
import play.api.mvc.ControllerComponents

trait CricketControllers {
  def cricketStatsJob: CricketStatsJob
  def controllerComponents: ControllerComponents
  implicit def appContext: ApplicationContext
  lazy val cricketMatchController = wire[CricketMatchController]
}
