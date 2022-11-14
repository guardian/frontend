package feed

import com.gu.commercial.branding.BrandingFinder
import common.{Edition, GuLogging, editions}
import contentapi.{ContentApiClient, QueryDefaults}
import implicits.Requests.RichRequestHeader
import model.RelatedContentItem
import services.OphanMostReadItem

import java.net.URL
import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

sealed trait Country {
  val code: String
  val edition: Edition
}
object Country {
  def fromHeaderString(header: RichRequestHeader): Country =
    header.countryCode.toLowerCase match {
      case "gb" => GB
      case "us" => US
      case "ca" => CA
      case "au" => AU
      case "in" => IN
      case "ng" => NG
      case "nz" => NZ
      case _    => ROW
    }
}
case object GB extends Country {
  val code = "gb"
  val edition = editions.Uk
}
case object US extends Country {
  val code = "us"
  val edition = editions.Us
}
case object AU extends Country {
  val code = "au"
  val edition = editions.Au
}
case object CA extends Country {
  val code = "ca"
  val edition = editions.Us
}
case object IN extends Country {
  val code = "in"
  val edition = Edition.defaultEdition
}
case object NG extends Country {
  val code = "ng"
  val edition = Edition.defaultEdition
}
case object NZ extends Country {
  val code = "nz"
  val edition = editions.Au
}
case object ROW extends Country {
  val code = "row"
  val edition = Edition.defaultEdition
}

object MostViewed extends GuLogging {

  def urlToContentPath(url: String): String = {
    val path = new URL(url).getPath
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
