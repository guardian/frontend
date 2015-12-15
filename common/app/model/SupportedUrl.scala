package model

import com.gu.contentapi.client.model.{ Content => ApiContent, Tag => ApiTag, Section => ApiSection }
import model.pressed._

// NEVER FORGET - Just calling this SupportedUrl doesn't make it not UrlBuilder, y'know.
object SupportedUrl {
  def apply(c: ApiContent): String = s"/${c.id}"

  def apply(t: ApiTag): String = s"/${t.id}"

  def apply(s: ApiSection): String = s"/${s.id}"

  def fromFaciaContent(fc: PressedContent): String = fc match {
    case curatedContent: CuratedContent => s"/${curatedContent.properties.href.getOrElse(fc.card.id)}"
    case supportingCuratedContent: SupportingCuratedContent => s"/${supportingCuratedContent.properties.href.getOrElse(fc.card.id)}"
    case linkSnap: LinkSnap => linkSnap.properties.href.orElse(linkSnap.snapUri).getOrElse(linkSnap.card.id)
    case latestSnap: LatestSnap => s"/${latestSnap.properties.maybeContent.map(_.metadata.id).orElse(latestSnap.snapUri).getOrElse(latestSnap.card.id)}"
  }
}
