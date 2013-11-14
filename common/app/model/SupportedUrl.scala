package model

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, Tag => ApiTag, Section => ApiSection }

// NEVER FORGET - Just calling this SupportedUrl doesn't make it not UrlBuilder, y'know.
object SupportedUrl {
  def apply(c: ApiContent): String = s"/${c.id}"

  def apply(t: ApiTag): String = s"/${t.id}"

  def apply(s: ApiSection): String = s"/${s.id}"
}
