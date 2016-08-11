package common

import akka.actor.ActorSystem
import app.LifecycleComponent
import model.diagnostics.commercial.{RedisReport, ExpiredKeyEventSubscriber}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

class DiagnosticsLifecycle(appLifecycle: ApplicationLifecycle, jobs: JobScheduler, system: ActorSystem)(implicit ec: ExecutionContext) extends LifecycleComponent with Logging {

  appLifecycle.addStopHook { () => Future {
    descheduleJobs()
  }}

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

  // Construct the singleton subscriber class when the DiagnosticsLifecycle class is instantiated.
  val subscriber: Option[ExpiredKeyEventSubscriber] = {
    RedisReport.redisClient.map { client =>
      log.logger.info("Creating ExpiredKeyEventSubscriber to listen to redis key events")
      new ExpiredKeyEventSubscriber(client, system)

    }
  }
}
