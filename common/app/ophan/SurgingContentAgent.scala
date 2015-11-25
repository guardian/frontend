package ophan

import common.{AkkaAsync, Jobs, _}
import org.joda.time.DateTime
import play.api.libs.json.{JsArray, JsValue}
import play.api.{GlobalSettings, Application => PlayApp}
import services.OphanApi

object SurgingContentAgent extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[SurgingContent](SurgingContent())

  def update() {
    log.info("Refreshing surging content.")
    val ophanQuery = OphanApi.getSurgingContent()
    ophanQuery.map { ophanResults =>
      val surging: Seq[(String, Int)] = SurgeUtils.parse(ophanResults)
      agent.send(SurgingContent(surging.toMap))
    }
  }

  def getSurging = agent.get()

  def getSurgingLevelsFor(id: String): Seq[Int] = SurgeUtils.levelProvider(agent.get().surges.get(id))
}


case class SurgingContent(surges: Map[String, Int] = Map.empty, lastUpdated: DateTime = DateTime.now()) {

  lazy val sortedSurges: Seq[(String, Int)] = surges.toSeq.sortBy(_._2).reverse
}


object SurgeUtils {

  def levelProvider(surgeLevel: Option[Int]): Seq[Int] = {

    val level = surgeLevel match {
      case Some(x) if x >= 400 => 1
      case Some(x) if x >= 300 => 2
      case Some(x) if x >= 200 => 3
      case Some(x) if x >= 100 => 4
      case _ => 0
    }

    if (level == 0) Seq(0) else Seq.range(level, 5)
  }

  def parse(json: JsValue) = {
    for {
      item: JsValue <- json.asOpt[JsArray].map(_.value).getOrElse(Nil)
      url <- (item \ "path").asOpt[String].map(_.drop(1)) // Our content Ids don't start with a slash
      count <- (item \ "pvs-per-min").asOpt[Int]
    } yield {
      (url, count)
    }
  }
}

trait SurgingContentAgentLifecycle extends GlobalSettings {
  override def onStart(app: PlayApp) {
    super.onStart(app)

    Jobs.deschedule("SurgingContentAgentRefreshJob")

    // update every 30 min, on the 51st second past the minute (e.g 13:09:51, 13:39:51)
    Jobs.schedule("SurgingContentAgentRefreshJob",  "51 9/30 * * * ?") {
      SurgingContentAgent.update()
    }

    AkkaAsync {
      SurgingContentAgent.update()
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("SurgingContentAgentRefreshJob")
    super.onStop(app)
  }
}
