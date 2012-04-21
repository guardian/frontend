package frontend.common

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, Tag => ApiTag }
import play.api.Play

// NEVER FORGET - Just calling this SupportedUrl doesn't make it not UrlBuilder, y'know.
object SupportedUrl {

  //PROD here means 'not running on a local dev machine'
  //in unit tests there is no running application, hence maybeApplication
  private lazy val isProd = Play.maybeApplication.map { Play.isProd(_) } getOrElse false

  //urls still work on local dev machines when not behind Nginx
  private lazy val prefix = if (isProd) "/" else "/pages/"

  def apply(c: ApiContent): String = if (c isSupportedInApp) "%s%s" format (prefix, c.id) else c.webUrl

  def apply(t: ApiTag): String = "%s%s" format (prefix, t.id)

}