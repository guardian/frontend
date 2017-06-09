package feed

import common.{Edition, Logging}
import contentapi.ContentApiClient
import model.RelatedContentItem
import services.MostReadItem
import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

object MostViewed extends Logging {

  def relatedContentItems(ophanMostViewed: Future[Seq[MostReadItem]])
                         (contentApiClient: ContentApiClient)
                         (implicit ec: ExecutionContext): Future[Seq[Option[RelatedContentItem]]] = {

    ophanMostViewed.flatMap { allMostViewed =>
      val allRelatedContentItems: Seq[Future[Option[RelatedContentItem]]] = allMostViewed.map { mostReadItem =>
        val url = mostReadItem.url
        contentApiClient
          .getResponse(contentApiClient.item(urlToContentPath(url), Edition.defaultEdition))
          .map(_.content.map(RelatedContentItem(_)))
          .recover {
            case NonFatal(e) =>
              log.error(s"Error requesting $url", e)
              None
          }
      }
      Future.sequence(allRelatedContentItems)
    }
  }

}
