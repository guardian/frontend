package layout

import model.pressed._
import views.support._

case class SnapStuff(
    dataAttributes: String,
    snapCss: Option[String],
    snapType: SnapType,
    embedHtml: Option[String],
    embedCss: Option[String] = None,
    embedJs: Option[String] = None,
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

    faciaContent.properties.embedType match {
      case Some("latest") => Some(SnapStuff(snapData, faciaContent.properties.embedCss, FrontendLatestSnap, embedHtml))
      case Some("link")   => Some(SnapStuff(snapData, faciaContent.properties.embedCss, FrontendLinkSnap, embedHtml))
      case Some("interactive") =>
        Some(SnapStuff(snapData, faciaContent.properties.embedCss, FrontendLinkSnap, embedHtml, embedCss, embedJs))
      case Some(_) => Some(SnapStuff(snapData, faciaContent.properties.embedCss, FrontendOtherSnap, embedHtml))
      case None    => None
    }
  }
}
