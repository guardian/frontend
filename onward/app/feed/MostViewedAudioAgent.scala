package feed

import java.net.URL

import conf.LiveContentApi
import common._
import model.{Audio, Content}
import play.api.libs.json.{JsArray, JsValue}
import scala.concurrent.Future
import LiveContentApi.getResponse

object MostViewedAudioAgent extends Logging with ExecutionContexts {

  private val audioAgent = AkkaAgent[Seq[Audio]](Nil)
  private val podcastAgent = AkkaAgent[Seq[Audio]](Nil)

  def mostViewedAudio(): Seq[Audio] = audioAgent()
  def mostViewedPodcast(): Seq[Audio] = podcastAgent()

  private def UrlToContentPath(url: String): String = {
    val path = new URL(url).getPath
    if (path.startsWith("/")) path.substring(1) else path
  }

  def refresh() = {
    log.info("Refreshing most viewed audio.")

    val ophanResponse = services.OphanApi.getMostViewedAudio(hours = 3, count = 100)

    ophanResponse.map { result =>

      val mostViewed: Iterable[Future[Option[Content]]] = for {
        item: JsValue <- result.asOpt[JsArray].map(_.value).getOrElse(Nil)
        url <- (item \ "url").asOpt[String]
        count <- (item \ "count").asOpt[Int]
      } yield {
        getResponse(LiveContentApi.item(UrlToContentPath(url), Edition.defaultEdition)).map(_.content.map(Content(_)))
      }

      Future.sequence(mostViewed).map { contentSeq =>
        val allAudio = contentSeq.toSeq.collect {
          case Some(audio: Audio) => audio
        }
        val audio = allAudio.filter(!_.isPodcast)
        val podcast = allAudio.filter(_.isPodcast)

        audioAgent alter audio
        podcastAgent alter podcast
      }
    }
  }
}
