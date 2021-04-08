package services.newsletters

import app.LifecycleComponent
import common.JobScheduler
import play.api.inject.ApplicationLifecycle

import java.util.concurrent.Executors
import scala.concurrent.{ExecutionContext, ExecutionContextExecutorService, Future}

class NewsletterSignupLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    newsletterSignupAgent: NewsletterSignupAgent,
)(implicit
    ec: ExecutionContext,
) extends LifecycleComponent {

  appLifecycle.addStopHook { () =>
    Future {
      descheduleAll()
    }
  }

  private def descheduleAll(): Unit = {
    jobs.deschedule("NewsletterSignupAgentLowFrequencyRefreshJob")
  }

  override def start(): Unit = {

    descheduleAll()
    newsletterSignupAgent.refresh()
    jobs.scheduleEveryNMinutes("NewsletterSignupAgentLowFrequencyRefreshJob", 60) {
      newsletterSignupAgent.refresh()
      Future.successful(())
    }
  }

}
