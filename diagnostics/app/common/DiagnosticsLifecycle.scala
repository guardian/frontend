package common

import akka.actor.ActorSystem
import app.LifecycleComponent
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

class DiagnosticsLifecycle(appLifecycle: ApplicationLifecycle, jobs: JobScheduler)(implicit
    ec: ExecutionContext,
    actorSystem: ActorSystem,
) extends LifecycleComponent
    with GuLogging {

  appLifecycle.addStopHook { () =>
    Future {
      descheduleJobs()
    }
  }

  private def scheduleJobs() {
    jobs.schedule("DiagnosticsLoadJob", "0 * * * * ?") {
      model.diagnostics.analytics.UploadJob.run()
    }
  }

  private def descheduleJobs() {
    jobs.deschedule("DiagnosticsLoadJob")
  }

  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()
  }

}
