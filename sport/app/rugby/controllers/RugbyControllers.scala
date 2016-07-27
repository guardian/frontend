package rugby.controllers

import com.softwaremill.macwire._
import rugby.jobs.RugbyStatsJob

trait RugbyControllers {
  def rugbyStatsJob: RugbyStatsJob
  lazy val matchesController = wire[MatchesController]
}
