package ophan

import common._
import play.api.libs.json.{JsArray, JsValue}
import java.net.URL
import services.OphanApi
import play.api.{Application => PlayApp, GlobalSettings}
import common.{AkkaAsync, Jobs}

object SurgingContentAgent extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[Map[String, Int]](Map.empty)

  def update() {
    log.info("Refreshing surging content.")

    val ophanQuery = OphanApi.getSurgingContent()

    ophanQuery.map{ ophanResults =>

      val surging: Seq[(String, Int)] = SurgeUtils.parse(ophanResults)

      agent.update(surging.toMap)
    }
  }

  def stop() {
    agent.close()
  }

  def isSurging(id: String): Boolean = {
    agent.get().contains(id)
  }


}

object SurgeUtils {
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

    // update every 30 min
    Jobs.schedule("SurgingContentAgentRefreshJob",  "0 0/30 * * * ?") {
      SurgingContentAgent.update()
    }

    AkkaAsync {
      SurgingContentAgent.update()
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("SurgingContentAgentRefreshJob")

    SurgingContentAgent.stop()

    super.onStop(app)
  }
}
