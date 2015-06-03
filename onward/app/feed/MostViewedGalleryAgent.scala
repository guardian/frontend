package feed

import conf.LiveContentApi
import common._
import model.{Content, Gallery}
import play.api.libs.json.{JsArray, JsValue}
import scala.concurrent.Future
import LiveContentApi.getResponse

object MostViewedGalleryAgent extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[Seq[Gallery]](Nil)

  def mostViewedGalleries(): Seq[Gallery] = agent()

  def refresh() = {
    log.info("Refreshing most viewed galleries.")

    val ophanResponse = services.OphanApi.getMostViewedGalleries(hours = 3, count = 12)

    ophanResponse.map { result =>

      val mostViewed: Iterable[Future[Option[Content]]] = for {
        item: JsValue <- result.asOpt[JsArray].map(_.value).getOrElse(Nil)
        url <- (item \ "url").asOpt[String]
        count <- (item \ "count").asOpt[Int]
      } yield {
        getResponse(LiveContentApi.item(urlToContentPath(url), Edition.defaultEdition)).map(_.content.map(Content(_)))
      }

      Future.sequence(mostViewed).map { contentSeq =>
        val galleries = contentSeq.toSeq.collect {
          case Some(gallery: Gallery) => gallery
        }
        agent alter galleries
      }
    }
  }
}
