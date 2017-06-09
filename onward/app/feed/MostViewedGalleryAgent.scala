package feed

import contentapi.ContentApiClient
import common._
import model.RelatedContentItem
import scala.concurrent.{ExecutionContext, Future}
import services.OphanApi

class MostViewedGalleryAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends Logging {

  private val agent = AkkaAgent[Seq[RelatedContentItem]](Nil)

  def mostViewedGalleries(): Seq[RelatedContentItem] = agent()

  def refresh()(implicit ec: ExecutionContext): Future[Seq[RelatedContentItem]] = {
    log.info("Refreshing most viewed galleries.")

    val ophanMostViewed = ophanApi.getMostViewedGalleries(hours = 3, count = 12)
    MostViewed.relatedContentItems(ophanMostViewed)(contentApiClient).flatMap { items =>
      val galleries = items.collect {
        case gallery if gallery.exists(_.content.tags.isGallery) => gallery
      }
      agent alter galleries.flatten
    }
  }
}
