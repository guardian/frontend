package commercial.targeting

import app.LifecycleComponent
import common.LoggingField.LogFieldString
import common.{AkkaAsync, JobScheduler, Logging}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.duration._
import scala.concurrent.{Future, ExecutionContext}

class TargetingLifecycle(
                          appLifecycle: ApplicationLifecycle,
                          jobs: JobScheduler,
                          akkaAsync: AkkaAsync)(implicit executionContext: ExecutionContext) extends LifecycleComponent with Logging {


  appLifecycle.addStopHook {
    () => Future {
      jobs.deschedule("TargetingCampaignRefreshJob")
    }
  }

  override def start(): Unit = {
    jobs.deschedule("TargetingCampaignRefreshJob")

    logInfoWithCustomFields("CampaignAgent BEFORE refresh scheduled ",
      customFields = List(
        LogFieldString("campaign agent", s"$CampaignAgent")
      )
    )

    jobs.scheduleEvery("TargetingCampaignRefreshJob", 1.minutes) {
      CampaignAgent.refresh()
    }

    logInfoWithCustomFields(s"CampaignAgent AFTER refresh",
      customFields = List(
        LogFieldString("campaign agent", s"$CampaignAgent")
    ))

    akkaAsync.after1s {
      CampaignAgent.refresh()
    }
  }
}
