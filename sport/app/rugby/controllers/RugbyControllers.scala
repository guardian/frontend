
package rugby.controllers

import com.softwaremill.macwire._
import play.api.Environment
import rugby.jobs.RugbyStatsJob

trait RugbyControllers {
  def rugbyStatsJob: RugbyStatsJob
  implicit def environment: Environment
  lazy val matchesController = wire[MatchesController]
}
