package agents

import common._
import common.editions._
import contentapi.ContentApiClient
import feed.MostViewed
import model.RelatedContentItem
import services.OphanApi

import scala.concurrent.{ExecutionContext, Future}

class MostViewedAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends GuLogging {

  private val mostViewedBox = Box[Map[Edition, Seq[RelatedContentItem]]](Map.empty)

  // todo: better typing for country codes
  def mostViewed(edition: Edition): Seq[RelatedContentItem] =
    mostViewedBox().getOrElse(edition, Nil)

  private def refresh(
      edition: Edition,
  )(implicit ec: ExecutionContext): Future[Map[Edition, Seq[RelatedContentItem]]] = {
    val countryCode = edition match {
      case Uk            => "gb"
      case Us            => "us"
      case Au            => "au"
      case International => "international" // todo: check this
      case Europe        => "international"
    }
    val ophanMostViewed = ophanApi.getMostRead(hours = 3, count = 10, country = countryCode)
    MostViewed.relatedContentItems(ophanMostViewed, edition)(contentApiClient).flatMap { items =>
      val validItems = items.flatten
      if (validItems.nonEmpty) {
        log.debug(s"Geo popular ${countryCode} updated successfully.")
      } else {
        log.debug(s"Geo popular update for ${countryCode} found nothing.")
      }
      mostViewedBox.alter(_ + (edition -> validItems))
    }
  }

  def refresh()(implicit ec: ExecutionContext): Future[Map[Edition, Seq[RelatedContentItem]]] = {
    MostViewed.refreshAll(Edition.allEditions)(refresh)
  }
}
