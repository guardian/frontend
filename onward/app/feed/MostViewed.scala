package feed

import com.gu.commercial.branding.BrandingFinder
import common.{Edition, GuLogging}
import contentapi.{ContentApiClient, QueryDefaults}
import model.RelatedContentItem
import services.OphanMostReadItem
import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

object MostViewed extends GuLogging {

  def relatedContentItems(ophanMostViewed: Future[Seq[OphanMostReadItem]], edition: Edition = Edition.defaultEdition)(
      contentApiClient: ContentApiClient,
  )(implicit ec: ExecutionContext): Future[Seq[Option[RelatedContentItem]]] = {

    ophanMostViewed.flatMap { allMostViewed =>
      val allRelatedContentItems: Seq[Future[Option[RelatedContentItem]]] = allMostViewed.map { mostReadItem =>
        val url = mostReadItem.url
        contentApiClient
          .getResponse(
            contentApiClient
              .item(urlToContentPath(url), edition)
              .showSection(true)
              .showFields((QueryDefaults.trailFieldsList :+ "isInappropriateForSponsorship").mkString(",")),
          )
          .map(
            _.content
              .filterNot { content => BrandingFinder.findBranding(edition.id)(content).exists(_.isPaid) }
              .map(RelatedContentItem(_)),
          )
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
