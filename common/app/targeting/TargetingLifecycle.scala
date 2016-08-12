package targeting

import app.LifecycleComponent
import common.{JobScheduler, AkkaAsync}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{Future, ExecutionContext}

class TargetingLifecycle(
  appLifecycle: ApplicationLifecycle,
  jobs: JobScheduler,
  akkaAsync: AkkaAsync)(implicit executionContext: ExecutionContext) extends LifecycleComponent {

  appLifecycle.addStopHook { () => Future {
    jobs.deschedule("TargetingCampaignRefreshJob")
  }}

  override def start(): Unit = {
    jobs.deschedule("TargetingCampaignRefreshJob")
    jobs.schedule("TargetingCampaignRefreshJob", "0 * * * * ?") {
      CampaignAgent.refresh()
    }
  }
}

