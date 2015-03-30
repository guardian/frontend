package feed

import conf.LiveContentApi
import common._
import model.{Content, Video}
import scala.concurrent.Future
import play.api.libs.json._
import LiveContentApi.getResponse

object MostViewedVideoAgent extends Logging with ExecutionContexts {

  case class QueryResult(id: String, count: Double, paths: Seq[String])

  private val agent = AkkaAgent[Seq[Video]](Nil)

  implicit val ophanQueryReads = Json.reads[QueryResult]

  def mostViewedVideo(): Seq[Video] = agent()

  def refresh() = {
    log.info("Refreshing most viewed video.")

    val ophanResponse = services.OphanApi.getMostViewedVideos(hours = 3, count = 12)

    ophanResponse.map { result =>

      val mostViewed: Iterable[Future[Option[Content]]] = for {
        videoResult <- result.asOpt[JsArray].map(_.value).getOrElse(Nil)
        path <- videoResult.validate[QueryResult].asOpt.map(_.paths).getOrElse(Nil) if path.contains("/video/")
      } yield {
        getResponse(LiveContentApi.item(path, Edition.defaultEdition)).map(_.content.map(Content(_)))
      }

      Future.sequence(mostViewed).map { contentSeq =>
        val videos = contentSeq.toSeq.collect {
          case Some(video: Video) => video
        }
        agent alter videos
      }
    }
  }
}
