package feed

import common._
import services.OphanApi
import play.api.libs.json.{JsArray, JsValue}

case class MostRead(url: String, count: Int)

object OnwardJourneyAgent extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[Map[String, MostRead]](Map[String, MostRead]())

  def mostPopular(): Map[String,MostRead] = agent()

  def update() {

    val ophanQuery = OphanApi.getMostRead(1)
    ophanQuery.map { ophanResults =>

      log.info("Adding onward journeys")

      // Parse ophan results into a sequence of objects.
      val mostRead: Seq[MostRead] = for {
        item: JsValue <- ophanResults.asOpt[JsArray].map(_.value).getOrElse(Nil)
        url <- (item \ "url").asOpt[String]
        count <- (item \ "count").asOpt[Int]
      } yield {
        MostRead(url, count )
      }

      // Add each ophan result to the map.
      agent send ( currentMap =>
        mostRead.foldRight(currentMap)((mostRead, previousMap) => {
          previousMap.updated(mostRead.url, mostRead)
        })
      )
    }
  }
}