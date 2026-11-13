package services.articleabtest

import app.LifecycleComponent
import common._
import play.api.inject.ApplicationLifecycle
import services.ArticleAbTestAgent

import scala.concurrent.{ExecutionContext, Future}

class ArticleAbTestLifecycle(
    articleAbTestAgent: ArticleAbTestAgent,
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
)(implicit
    ec: ExecutionContext,
) extends LifecycleComponent {

  private val every30Seconds = "0/30 * * * * ?"

  appLifecycle.addStopHook { () =>
    Future {
      jobs.deschedule("ArticleAbTestAgentJob")
    }
  }

  override def start(): Unit = {
    jobs.deschedule("ArticleAbTestAgentJob")
    jobs.schedule("ArticleAbTestAgentJob", every30Seconds) {
      articleAbTestAgent.refresh()
    }

    articleAbTestAgent.refresh()
  }
}
