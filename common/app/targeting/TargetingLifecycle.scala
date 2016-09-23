package targeting

import app.LifecycleComponent
import common.{JobScheduler, AkkaAsync}
import play.api.inject.ApplicationLifecycle
import scala.concurrent.duration._
import scala.concurrent.{Future, ExecutionContext}
import conf.switches.Switches.Targeting

class TargetingLifecycle(
  appLifecycle: ApplicationLifecycle,
  jobs: JobScheduler,
  akkaAsync: AkkaAsync)(implicit executionContext: ExecutionContext) extends LifecycleComponent {


    appLifecycle.addStopHook {
      () => Future {
        if (Targeting.isSwitchedOn) {
          jobs.deschedule("TargetingCampaignRefreshJob")
        }
      }
    }

  override def start(): Unit = {
    if (Targeting.isSwitchedOn) {
      jobs.deschedule("TargetingCampaignRefreshJob")
      jobs.scheduleEvery("TargetingCampaignRefreshJob", 1.minutes) {
        CampaignAgent.refresh()
      }

      akkaAsync.after1s {
        CampaignAgent.refresh()
      }
    }
  }
}

