package common.commercial

import app.LifecycleComponent
import common.{JobScheduler, AkkaAsync}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import common.dfp.RemoteBundleRetriever

class BundleLifecycle(
    appLifeCycle: ApplicationLifecycle,
    jobs: JobScheduler,
    akkaAsync: AkkaAsync,
    remoteBundleRetriever: RemoteBundleRetriever,
)(implicit
    ec: ExecutionContext,
) extends LifecycleComponent {

  appLifeCycle.addStopHook { () =>
    Future {
      jobs.deschedule("BundleLifecycleJob")
    }
  }

  def refreshDfpAgent(): Unit = {
    println("refreshing...")
    remoteBundleRetriever.run()
  }

  override def start(): Unit = {
    jobs.deschedule("BundleLifecycleJob")
    jobs.scheduleEvery("BundleLifecycleJob", 10.seconds) {
      refreshDfpAgent()
      Future.successful(())
    }

    akkaAsync.after1s {
      refreshDfpAgent()
    }
  }
}
