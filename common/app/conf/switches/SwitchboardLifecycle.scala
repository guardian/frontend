package conf.switches

import app.LifecycleComponent
import common._
import conf.Configuration
import play.api.inject.ApplicationLifecycle
import scala.concurrent.duration._
import scala.concurrent.{Future, ExecutionContext}

class SwitchboardLifecycle(appLifecycle: ApplicationLifecycle, jobs: JobScheduler, pekkoAsync: PekkoAsync)(implicit
    ec: ExecutionContext,
) extends LifecycleComponent
    with GuLogging {

  appLifecycle.addStopHook { () =>
    Future {
      jobs.deschedule("SwitchBoardRefreshJob")
    }
  }

  override def start(): Unit = {

    Switches.all.foreach(_.failInitializationAfter(2.minutes)(pekkoAsync))

    jobs.deschedule("SwitchBoardRefreshJob")
    // run every minute, 47 seconds after the minute
    jobs.schedule("SwitchBoardRefreshJob", "47 * * * * ?") {
      refresh()
    }

    pekkoAsync.after1s {
      refresh()
    }
  }

  def refresh(): Unit = {
    log.debug("Refreshing switches")
    services.S3.get(Configuration.switches.key) foreach { response =>
      val nextState = Properties(response)

      for (switch <- Switches.all) {
        nextState.get(switch.name) match {
          case Some("on")  => switch.switchOn()
          case Some("off") => switch.switchOff()
          case _           =>
            log.info(
              s"No state has yet been initialised for ${switch.name} in the switchboard, which probably means the switchboard has not been updated and/or saved since this switch was created. Setting it to its safe state for now.",
            )
            switch.switchToSafeState()
        }
      }
    }
  }
}
