package model

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, Tag => ApiTag, Section => ApiSection }

// NEVER FORGET - Just calling this SupportedUrl doesn't make it not UrlBuilder, y'know.
object SupportedUrl {
  def apply(c: ApiContent): String = if (isSupportedInApp(c)) "/%s" format c.id else c.webUrl

  def apply(t: ApiTag): String = "/%s" format t.id

  def apply(s: ApiSection): String = "/%s" format s.id

  private def isSupportedInApp(c: ApiContent) = c.isArticle || c.isGallery
}
