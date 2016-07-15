package rugby.controllers

import com.softwaremill.macwire._

trait RugbyControllers {
  lazy val matchesController = wire[MatchesController]
}
