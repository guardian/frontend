package feed

import common._
import play.api.libs.json.{JsArray, JsValue}
import services.OphanApi

class MostReadAgent(ophanApi: OphanApi) extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[Map[String, Int]](Map.empty)

  def update() {
    log.info("Refreshing most read.")

    // limiting to sport/football section for now as this is only used by popular-in-tag component
    val ophanQuery = ophanApi.getMostReadInSection("sport,football", 2, 1000)

    ophanQuery.map{ ophanResults =>

      val mostRead: Seq[(String, Int)] = for {
        item: JsValue <- ophanResults.asOpt[JsArray].map(_.value).getOrElse(Nil)
        url <- (item \ "url").asOpt[String]
        count <- (item \ "count").asOpt[Int]
      } yield {
        (urlToContentPath(url), count)
      }

      agent.alter(mostRead.toMap)
    }
  }

  def getViewCount(id: String): Option[Int] = {
    agent.get().get(id)
  }
}
