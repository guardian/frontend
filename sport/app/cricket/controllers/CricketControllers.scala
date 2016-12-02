package cricket.controllers

import com.softwaremill.macwire._
import jobs.CricketStatsJob
import play.api.Environment

trait CricketControllers {
  def cricketStatsJob: CricketStatsJob
  implicit def environment: Environment
  lazy val cricketMatchController = wire[CricketMatchController]
}
