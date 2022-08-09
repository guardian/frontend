package agents

import akka.actor.ActorSystem
import app.LifecycleComponent
import common.JobScheduler

import scala.concurrent.ExecutionContext

class MostPopularLifecycle(deeplyReadAgent: DeeplyReadAgent, jobs: JobScheduler)(implicit
    ec: ExecutionContext,
    actorSystem: ActorSystem,
) extends LifecycleComponent {

  override def start(): Unit =
    jobs.scheduleEveryNMinutes("MostPopularAgentsFrequencyRefreshJob", 5) {
      deeplyReadAgent.refresh()
    }
}
