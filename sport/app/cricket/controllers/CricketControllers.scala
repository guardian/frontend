package cricket.controllers

import com.softwaremill.macwire._
import jobs.CricketStatsJob
import model.ApplicationContext
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents

trait CricketControllers {
  def cricketStatsJob: CricketStatsJob
  def controllerComponents: ControllerComponents
  def wsClient: WSClient
  implicit def appContext: ApplicationContext
  lazy val cricketMatchController: CricketMatchController = wire[CricketMatchController]
}
