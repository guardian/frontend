package feed

import conf.LiveContentApi
import common._
import model.RelatedContentItem
import play.api.libs.json.{JsArray, JsValue}
import scala.concurrent.Future
import LiveContentApi.getResponse

object MostViewedAudioAgent extends Logging with ExecutionContexts {

  private val audioAgent = AkkaAgent[Seq[RelatedContentItem]](Nil)
  private val podcastAgent = AkkaAgent[Seq[RelatedContentItem]](Nil)

  def mostViewedAudio(): Seq[RelatedContentItem] = audioAgent()
  def mostViewedPodcast(): Seq[RelatedContentItem] = podcastAgent()

  def refresh() = {
    log.info("Refreshing most viewed audio.")

    val ophanResponse = services.OphanApi.getMostViewedAudio(hours = 3, count = 100)

    ophanResponse.map { result =>

      val mostViewed: Iterable[Future[Option[RelatedContentItem]]] = for {
        item: JsValue <- result.asOpt[JsArray].map(_.value).getOrElse(Nil)
        url <- (item \ "url").asOpt[String]
        count <- (item \ "count").asOpt[Int]
      } yield {
        getResponse(LiveContentApi.item(urlToContentPath(url), Edition.defaultEdition)).map(_.content.map { item =>
          RelatedContentItem(item)
        })
      }

      Future.sequence(mostViewed).map { contentSeq =>
        val allAudio = contentSeq.toSeq.collect {
          case audio if audio.exists(_.content.tags.isAudio) => audio
        }
        val audio = allAudio.flatten.filter(!_.content.tags.isPodcast)
        val podcast = allAudio.flatten.filter(_.content.tags.isPodcast)

        audioAgent alter audio
        podcastAgent alter podcast
      }
    }
  }
}
