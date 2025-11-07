package feed

import com.gu.commercial.branding.BrandingFinder
import common.{Edition, GuLogging}
import contentapi.{ContentApiClient, QueryDefaults}
import model.RelatedContentItem
import services.OphanMostReadItem

import java.net.URI
import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

object MostViewed extends GuLogging {

  def urlToContentPath(url: String): String = {
    val path = new URI(url).getPath
    if (path.startsWith("/")) path.substring(1) else path
  }

  // This function takes a sequence of items and a function that maps each item to a future.
  // Each future carries a map, all the maps are collapsed into one using a reduce
  def refreshAll[A, B](as: Seq[A])(
      refreshOne: A => Future[Map[B, Seq[RelatedContentItem]]],
  )(implicit ec: ExecutionContext): Future[Map[B, Seq[RelatedContentItem]]] = {
    as.map(refreshOne)
      .reduce((itemsF, otherItemsF) =>
        for {
          items <- itemsF
          otherItems <- otherItemsF
        } yield items ++ otherItems,
      )
  }

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
          .recover { case NonFatal(e) =>
            log.error(s"Error requesting $url", e)
            None
          }
      }
      Future.sequence(allRelatedContentItems)
    }
  }

}
