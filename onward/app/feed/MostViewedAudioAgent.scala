package feed

import contentapi.ContentApiClient
import common._
import model.RelatedContentItem
import scala.concurrent.{ExecutionContext, Future}
import services.OphanApi

class MostViewedAudioAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends Logging {

  private val audioAgent = AkkaAgent[Seq[RelatedContentItem]](Nil)
  private val podcastAgent = AkkaAgent[Seq[RelatedContentItem]](Nil)

  def mostViewedAudio(): Seq[RelatedContentItem] = audioAgent()
  def mostViewedPodcast(): Seq[RelatedContentItem] = podcastAgent()

  def refresh()(implicit ec: ExecutionContext) : Future[Seq[RelatedContentItem]] = {
    log.info("Refreshing most viewed audio.")

    val ophanMostViewed = ophanApi.getMostViewedAudio(hours = 3, count = 100)
    MostViewed.relatedContentItems(ophanMostViewed)(contentApiClient).flatMap { items =>
      val (podcast, audio) =  items
        .filter(_.exists(_.content.tags.isAudio))
        .flatten
        .partition(_.content.tags.isPodcast)
      audioAgent alter audio
      podcastAgent alter podcast
    }
  }
}
