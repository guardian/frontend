package feed

import java.net.URL

import conf.LiveContentApi
import common._
import model.{Audio, Content}
import play.api.libs.json.{JsArray, JsValue}
import scala.concurrent.Future

object MostViewedAudioAgent extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[Seq[Audio]](Nil)

  def mostViewedAudio(): Seq[Audio] = agent()

  private def UrlToContentPath(url: String): String = {
    var contentId = new URL(url).getPath
    if (contentId.startsWith("/")) {
      contentId = contentId.substring(1)
    }
    contentId
  }

  def refresh() = {
    log.info("Refreshing most viewed audio.")

    val ophanResponse = services.OphanApi.getMostViewedAudio(hours = 3, count = 12)

    ophanResponse.map { result =>

      val mostViewed: Iterable[Future[Option[Content]]] = for {
        item: JsValue <- result.asOpt[JsArray].map(_.value).getOrElse(Nil)
        url <- (item \ "url").asOpt[String]
        count <- (item \ "count").asOpt[Int]
      } yield {
        LiveContentApi.item(UrlToContentPath(url), Edition.defaultEdition).response.map(_.content.map(Content(_)))
      }

      Future.sequence(mostViewed).map { contentSeq =>
        val audio = contentSeq.toSeq.collect {
          case Some(audio: Audio) => audio
        }
        agent alter audio
      }
    }
  }
}
