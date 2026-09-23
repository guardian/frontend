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
    pekkoAsync: PekkoAsync,
)(implicit
    ec: ExecutionContext,
) extends LifecycleComponent {

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

    pekkoAsync.after1s {
      articleAbTestAgent.refresh()
    }
  }
}
