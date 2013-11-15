package feed

import common._
import services.OphanApi
import play.api.libs.json.{JsArray, JsValue}
import java.net.URL
import conf.SwitchingContentApi
import model.Content
import scala.concurrent.Future

case class MostRead(url: String, count: Int)
case class MostPopularOnward(trail:Content)

object OnwardJourneyAgent extends Logging with ExecutionContexts {

  private val mostReadAgent = AkkaAgent[List[MostRead]](Nil)
  private val popularOnwardAgent = AkkaAgent[Map[String, Seq[MostPopularOnward]]](Map[String, Seq[MostPopularOnward]]().withDefaultValue(Nil))

  def mostRead(): List[MostRead] = mostReadAgent()
  def mostPopularOnward(): Map[String, Seq[MostPopularOnward]] = popularOnwardAgent()

  def update() {
    log.info("Adding onward journeys")
    update(Edition.defaultEdition)
  }

  private def update(edition: Edition) {

    val ophanQuery = OphanApi.getMostRead(hours = 3, count = 50)
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

      val onwardQuery = OphanApi.getMostPopularOnward(path = id.url, hours = 3, count = 10, isContent = true)
      onwardQuery.map { ophanResults =>

        // Parse ophan results into a sequence, the Map value.
        val mostPopularOnward: Seq[Future[Option[MostPopularOnward]]] = for {
          parentArray: JsValue     <- ophanResults.asOpt[JsArray].map(_.value).getOrElse(Nil)
          ophanItem: JsValue       <- parentArray.asOpt[JsArray].map(_.value).getOrElse(Nil)
          contentId: String        <- (ophanItem \ "url").asOpt[String].map {UrlToContentPath(_)}
        } yield {
          SwitchingContentApi().item(contentId, edition).response.map { response =>
            response.content.map{content => MostPopularOnward(Content(content))}
          }
        }

        Future.sequence(mostPopularOnward).map { onwardTrails =>
          popularOnwardAgent send ( currentMap => {
            currentMap + (id.url -> onwardTrails.flatten)
          })
        }
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