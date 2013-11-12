package feed

import common._
import services.OphanApi
import play.api.libs.json.{JsArray, JsValue}
import java.net.URL

case class MostRead(url: String, count: Int)
case class MostPopularOnward(url: String)

object OnwardJourneyAgent extends Logging with ExecutionContexts {

  private val mostReadAgent = AkkaAgent[List[MostRead]](Nil)
  private val popularOnwardAgent = AkkaAgent[Map[String, Seq[MostPopularOnward]]](Map[String, Seq[MostPopularOnward]]().withDefaultValue(Nil))

  def mostRead(): List[MostRead] = mostReadAgent()
  def mostPopularOnward(): Map[String, Seq[MostPopularOnward]] = popularOnwardAgent()

  def update() {

    log.info("Adding onward journeys")

    val ophanQuery = OphanApi.getMostRead(3)
    ophanQuery.map { ophanResults =>

      // Parse ophan results into a sequence of objects.
      val mostRead: Seq[MostRead] = for {
        item: JsValue <- ophanResults.asOpt[JsArray].map(_.value).getOrElse(Nil)
        url <- (item \ "url").asOpt[String]
        count <- (item \ "count").asOpt[Int]
      } yield {
        MostRead(UrlToContentPath(url), count)
      }

      // Add each ophan result to the map.
      mostReadAgent update mostRead.toList
    }

    // Find a list of content which appears in the most read, but hasn't got
    // an entry in the 'popular onward' map.
   val remainingMostRead = mostRead.filterNot(id => mostPopularOnward.isDefinedAt(id.url))

    remainingMostRead.take(3).map( id => {

      val onwardQuery = OphanApi.getMostPopularOnward(id.url)
      onwardQuery.map { ophanResults =>

        // Parse ophan results into a sequence, the Map value.
        val mostPopularOnward: Seq[MostPopularOnward] = for {
          parentArray: JsValue <- ophanResults.asOpt[JsArray].map(_.value).getOrElse(Nil)
          item: JsValue <- parentArray.asOpt[JsArray].map(_.value).getOrElse(Nil)
          url <- (item \ "url").asOpt[String]
        } yield {
          MostPopularOnward(UrlToContentPath(url))
        }

        popularOnwardAgent send ( currentMap => {
          currentMap + (id.url -> mostPopularOnward)
        })
      }
    })
  }

  private def UrlToContentPath(url: String): String = {
    var contentId = new URL(url).getPath
    if (contentId.startsWith("/")) {
      contentId = contentId.substring(1)
    }
    contentId
  }
}