package controllers

import org.joda.time.DateTime
import org.scala_tools.time.Imports._
import common.{Logging, AkkaSupport}
import play.api.mvc.{Action, Controller}
import conf.CommonSwitches._

class ScheduleWatchController(private val scheduleWatchers: Seq[ScheduleWatch]) extends Controller {
  def render() = Action {
    if (ScheduleWatchSwitch.isSwitchedOn && scheduleWatchers.exists(_.isStale))
      InternalServerError
    else
      Ok
  }

  def shutdown() = scheduleWatchers.foreach(_.close())
}

class ScheduleWatch(val name: String, val gracePeriod: Duration) extends AkkaSupport with Logging {

  val agent = play_akka.agent(DateTime.now)

  def refresh() = agent.send(DateTime.now)

  def isStale = {
    val s = (agent() + gracePeriod) < DateTime.now
    if (s) log.info(s"$name is stale")
    s
  }

  def close() = agent.close()

}
