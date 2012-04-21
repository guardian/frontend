package frontend.common

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, Tag => ApiTag }
import play.api.Play

// NEVER FORGET - Just calling this SupportedUrl doesn't make it not UrlBuilder, y'know.
object SupportedUrl {

  def apply(c: ApiContent): String = if (c isSupportedInApp) "/%s" format c.id else c.webUrl

  def apply(t: ApiTag): String = "/%s" format t.id

}