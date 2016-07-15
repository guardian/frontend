package cricket.controllers

import com.softwaremill.macwire._

trait CricketControllers {
  lazy val cricketMatchController = wire[CricketMatchController]
}
