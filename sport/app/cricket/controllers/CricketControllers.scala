package cricket.controllers

import com.softwaremill.macwire._
import jobs.CricketStatsJob
import model.ApplicationContext
import play.api.Environment

trait CricketControllers {
  def cricketStatsJob: CricketStatsJob
  implicit def appContext: ApplicationContext
  lazy val cricketMatchController = wire[CricketMatchController]
}
