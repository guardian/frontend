package cricket.controllers

import com.softwaremill.macwire._
import jobs.CricketStatsJob

trait CricketControllers {
  def cricketStatsJob: CricketStatsJob
  lazy val cricketMatchController = wire[CricketMatchController]
}
