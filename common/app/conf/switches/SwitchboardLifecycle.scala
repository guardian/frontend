package conf.switches

import common._
import conf.Configuration
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{Future, ExecutionContext}

class SwitchboardLifecycle(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends LifecycleComponent with ExecutionContexts with Logging {

  appLifecycle.addStopHook { () => Future {
    Jobs.deschedule("SwitchBoardRefreshJob")
  }}

  override def start(): Unit = {
    Jobs.deschedule("SwitchBoardRefreshJob")
    //run every minute, 47 seconds after the minute
    Jobs.schedule("SwitchBoardRefreshJob", "47 * * * * ?") {
      refresh()
    }

    AkkaAsync {
      refresh()
    }
  }

  def refresh(): Unit = {
    log.info("Refreshing switches")
    services.S3.get(Configuration.switches.key) foreach { response =>

      val nextState = Properties(response)

      for (switch <- Switches.all) {
        nextState.get(switch.name) match {
          case Some("on") => switch.switchOn()
          case Some("off") => switch.switchOff()
          case other => {
            log.warn(s"Badly configured switch ${switch.name}, setting to safe state.")
            switch.switchToSafeState()
          }
        }
      }
    }
  }
}
