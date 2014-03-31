package feed

import common._
import play.api.libs.json.{JsArray, JsValue}
import java.net.URL
import services.OphanApi

object MostReadAgent extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[Map[String, Int]](Map.empty)

  def update() {
    log.info("Refreshing most read.")

    // limiting to sport/football section for popular/related ABTest
    val ophanQuery = OphanApi.getMostReadInSection("sport,football", 2, 1000)

    ophanQuery.map{ ophanResults =>

      val mostRead: Seq[(String, Int)] = for {
        item: JsValue <- ophanResults.asOpt[JsArray].map(_.value).getOrElse(Nil)
        url <- (item \ "url").asOpt[String]
        count <- (item \ "count").asOpt[Int]
      } yield {
        (UrlToContentPath(url), count)
      }

      agent.update(mostRead.toMap)
    }
  }

  def stop() {
    agent.close()
  }

  def getViewCount(id: String): Option[Int] = {
    agent.get().get(id)
  }

  private def UrlToContentPath(url: String): String = {
    var contentId = new URL(url).getPath
    if (contentId.startsWith("/")) {
      contentId = contentId.substring(1)
    }
    contentId
  }

}