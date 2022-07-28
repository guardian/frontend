package services.ophan

import app.LifecycleComponent
import com.gu.commercial.display.SurgeLookupService
import common._
import org.joda.time.DateTime
import play.api.inject.ApplicationLifecycle
import play.api.libs.json.{JsArray, JsValue}
import services.OphanApi

import scala.concurrent.{ExecutionContext, Future}

object SurgingContentAgent extends SurgeLookupService with GuLogging {

  private val agent = Box[SurgingContent](SurgingContent())

  def update(implicit ophanApi: OphanApi, executionContext: ExecutionContext): Unit = {
    log.info("Refreshing surging content.")
    val ophanQuery = ophanApi.getSurgingContent()
    ophanQuery.map { ophanResults =>
      val surging: Seq[(String, Int)] = SurgeUtils.parse(ophanResults)
      agent.send(SurgingContent(surging.toMap))
    }
  }

  def getSurging: SurgingContent = agent.get()

  override def pageViewsPerMinute(pageId: String): Option[Int] = getSurging.surges.get(pageId)
}

case class SurgingContent(surges: Map[String, Int] = Map.empty, lastUpdated: DateTime = DateTime.now()) {
  lazy val sortedSurges: Seq[(String, Int)] = surges.toSeq.sortBy(_._2).reverse
}

object SurgeUtils {
  def parse(json: JsValue): Seq[(String, Int)] = {
    for {
      item: JsValue <- json.asOpt[JsArray].map(_.value).getOrElse(Nil)
      url <- (item \ "path").asOpt[String].map(_.drop(1)) // Our content Ids don't start with a slash
      count <- (item \ "pvs-per-min").asOpt[Int]
    } yield {
      (url, count)
    }
  }
}

class SurgingContentAgentLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    akkaAsync: AkkaAsync,
    ophanApi: OphanApi,
)(implicit ec: ExecutionContext)
    extends LifecycleComponent {

  appLifecycle.addStopHook { () =>
    Future {
      jobs.deschedule("SurgingContentAgentRefreshJob")
    }
  }

  override def start(): Unit = {
    jobs.deschedule("SurgingContentAgentRefreshJob")

    // update every 30 min, on the 51st second past the minute (e.g 13:09:51, 13:39:51)
    jobs.schedule("SurgingContentAgentRefreshJob", "51 9/30 * * * ?") {
      SurgingContentAgent.update(ophanApi, ec)
    }

    akkaAsync.after1s {
      SurgingContentAgent.update(ophanApi, ec)
    }
  }
}
