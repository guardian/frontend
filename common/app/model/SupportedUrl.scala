package model

import com.gu.contentapi.client.model.{ Content => ApiContent, Tag => ApiTag, Section => ApiSection }
import com.gu.facia.api.models._
import implicits.FaciaContentImplicits._

// NEVER FORGET - Just calling this SupportedUrl doesn't make it not UrlBuilder, y'know.
object SupportedUrl {
  def apply(c: ApiContent): String = s"/${c.id}"

  def apply(t: ApiTag): String = s"/${t.id}"

  def apply(s: ApiSection): String = s"/${s.id}"

  def fromFaciaContent(fc: FaciaContent): String = fc match {
    case curatedContent: CuratedContent => s"/${curatedContent.href.getOrElse(fc.id)}"
    case supportingCuratedContent: SupportingCuratedContent => s"/${supportingCuratedContent.href.getOrElse(fc.id)}"
    case linkSnap: LinkSnap => linkSnap.href.orElse(linkSnap.snapUri).getOrElse(linkSnap.id)
    case latestSnap: LatestSnap => s"/${latestSnap.latestContent.map(_.id).orElse(latestSnap.snapUri).getOrElse(latestSnap.id)}"
  }
}
