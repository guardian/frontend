package services.articleabtest

import app.LifecycleComponent
import common._
import play.api.inject.ApplicationLifecycle
import services.ArticleAbTestAgent

import scala.concurrent.duration._
import scala.concurrent.{Await, ExecutionContext, Future}
import scala.util.{Failure, Success, Try}

class ArticleAbTestLifecycle(
    articleAbTestAgent: ArticleAbTestAgent,
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
)(implicit
    ec: ExecutionContext,
) extends LifecycleComponent
    with GuLogging {

  /*
   * We block application startup for up to 5 seconds while waiting for the initial cache warm-up.
   * If CAPI doesn't respond in time we give up waiting and let the app start with a cold (empty) cache
   * it will still be picked up by the next scheduled poll below.
   * */
  private val initialRefreshTimeout = 5.seconds

  appLifecycle.addStopHook { () =>
    Future {
      jobs.deschedule("ArticleAbTestAgentJob")
    }
  }

  override def start(): Unit = {
    jobs.deschedule("ArticleAbTestAgentJob")
    jobs.schedule("ArticleAbTestAgentJob", "0/30 * * * * ?") {
      articleAbTestAgent.refresh()
    }

    // Block the first startup on the initial refresh (with a timeout of 5 seconds) so the cache is warm before we start serving
    // requests, rather than racing an async refresh against the first incoming request.
    Try(Await.result(articleAbTestAgent.refresh(), initialRefreshTimeout)) match {
      case Success(_) =>
        log.info("Successfully warmed article ab test cache on startup.")
      case Failure(t) =>
        log.warn(s"Failed to warm article ab test cache on startup within $initialRefreshTimeout: $t")
    }
  }
}
