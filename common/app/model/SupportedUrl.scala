package model

import com.gu.contentapi.client.model.{ Content => ApiContent, Tag => ApiTag, Section => ApiSection }
import com.gu.facia.api.models.FaciaContent
import implicits.FaciaContentImplicits._

// NEVER FORGET - Just calling this SupportedUrl doesn't make it not UrlBuilder, y'know.
object SupportedUrl {
  def apply(c: ApiContent): String = s"/${c.id}"

  def apply(t: ApiTag): String = s"/${t.id}"

  def apply(s: ApiSection): String = s"/${s.id}"

  def fromFaciaContent(fc: FaciaContent): String = s"/${fc.href.getOrElse(fc.id)}"
}
