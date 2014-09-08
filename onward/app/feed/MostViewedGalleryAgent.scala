package feed

import conf.LiveContentApi
import common._
import model.{Content, Gallery}
import scala.concurrent.Future
import play.api.libs.json._

object MostViewedGalleryAgent extends Logging with ExecutionContexts {

  case class QueryResult(id: String, count: Double, paths: Seq[String])

  private val agent = AkkaAgent[Seq[Gallery]](Seq.empty)

  implicit val ophanQueryReads = Json.reads[QueryResult]

  def mostViewedGalleries(): Seq[Gallery] = agent()

  def refresh() = {
    log.info("Refreshing most viewed galleries.")

    val ophanResponse = services.OphanApi.getMostViewedVideos(hours = 3, count = 12)

    ophanResponse.map { result =>

      val mostViewed: Iterable[Future[Option[Content]]] = for {
        galleryResult <- result.asOpt[JsArray].map(_.value).getOrElse(Nil)
        path <- galleryResult.validate[QueryResult].asOpt.map(_.paths).getOrElse(Nil) if path.contains("/gallery/")
      } yield {
        LiveContentApi.item(path, Edition.defaultEdition).response.map(_.content.map(Content(_)))
      }

      Future.sequence(mostViewed).map { contentSeq =>
        val galleries = contentSeq.toSeq.collect {
          case Some(gallery: Gallery) => Gallery
        }
        agent alter galleries
      }
    }
  }
}