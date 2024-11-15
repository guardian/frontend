package layout

import java.net.URI
import model.pressed._
import views.support._
import services.NewsletterService
import conf.Configuration.newsletterApi

case class SnapStuff(
    dataAttributes: String,
    snapCss: Option[String],
    snapType: SnapType,
    embedHtml: Option[String],
    embedCss: Option[String] = None,
    embedJs: Option[String] = None,
    newsletterId: Option[String] = None,
) {
  def cssClasses: Seq[String] =
    Seq(
      Some("js-snap"),
      Some("facia-snap"),
      snapCss.map(t => s"facia-snap--$t").orElse(Some("facia-snap--default")),
      embedHtml.map(_ => "facia-snap-embed"),
    ).flatten
}

object SnapStuff {
  def fromTrail(faciaContent: PressedContent): Option[SnapStuff] = {
    val snapData = SnapData(faciaContent)

    // This val may exist if the facia press has pre-fetched the embed html. Currently only for CuratedContent or LinkSnap.
    val embedHtml = faciaContent match {
      case curated: CuratedContent => curated.enriched.flatMap(_.embedHtml)
      case link: LinkSnap          => link.enriched.flatMap(_.embedHtml)
      case _                       => None
    }

    val embedCss = faciaContent match {
      case curated: CuratedContent => curated.enriched.flatMap(_.embedCss)
      case link: LinkSnap          => link.enriched.flatMap(_.embedCss)
      case _                       => None
    }

    val embedJs = faciaContent match {
      case curated: CuratedContent => curated.enriched.flatMap(_.embedJs)
      case link: LinkSnap          => link.enriched.flatMap(_.embedJs)
      case _                       => None
    }

    val newsletterId = faciaContent.properties.href match {
      case Some(href) => {
        extractNewsletterId(href)
      }
      case None => None
    }

    faciaContent.properties.embedType match {
      case Some("latest") =>
        Some(SnapStuff(snapData, faciaContent.properties.embedCss, FrontendLatestSnap, embedHtml, newsletterId = None))
      case Some("link") =>
        newsletterId match {
          case Some(id) =>
            Some(
              SnapStuff(
                snapData,
                faciaContent.properties.embedCss,
                FrontendNewsletterSnap,
                embedHtml,
                newsletterId = Some(id),
              ),
            )
          case None =>
            Some(
              SnapStuff(snapData, faciaContent.properties.embedCss, FrontendLinkSnap, embedHtml, newsletterId = None),
            )
        }
      case Some("interactive") =>
        Some(
          SnapStuff(
            snapData,
            faciaContent.properties.embedCss,
            FrontendLinkSnap,
            embedHtml,
            embedCss,
            embedJs,
            newsletterId = None,
          ),
        )
      case Some(_) =>
        Some(SnapStuff(snapData, faciaContent.properties.embedCss, FrontendOtherSnap, embedHtml, newsletterId = None))
      case None => None
    }
  }

  private def isNewsletterApiUri(href: String): Boolean = {
    val prefix: Option[String] = for {
      host <- newsletterApi.host
      origin <- newsletterApi.origin
    } yield {
      s"$host/api/newsletters"
    }
    prefix match {
      case Some(url) => {
        href.startsWith(prefix)
      }
      case None => {
        println("newsletters API not configured!")
        false
      }
    }
  }

  private def extractNewsletterId(newsleterApiUri: String): Option[String] = {
    isNewsletterApiUri(newsleterApiUri) match {
      case true => {
        val lastPartofPath: String = new URI(newsleterApiUri).getPath.tail
        Some(lastPartofPath)
      }
      case _ => None
    }
  }
}
