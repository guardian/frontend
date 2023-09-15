package commercial.targeting

import app.LifecycleComponent
import common.{JobScheduler, PekkoAsync}
import play.api.inject.ApplicationLifecycle
import scala.concurrent.duration._
import scala.concurrent.{Future, ExecutionContext}

class TargetingLifecycle(appLifecycle: ApplicationLifecycle, jobs: JobScheduler, pekkoAsync: PekkoAsync)(implicit
    executionContext: ExecutionContext,
) extends LifecycleComponent {

  appLifecycle.addStopHook { () =>
    Future {
      jobs.deschedule("TargetingCampaignRefreshJob")
    }
  }

  override def start(): Unit = {
    jobs.deschedule("TargetingCampaignRefreshJob")
    jobs.scheduleEvery("TargetingCampaignRefreshJob", 1.minutes) {
      CampaignAgent.refresh()
    }

    pekkoAsync.after1s {
      CampaignAgent.refresh()
    }
  }
}
