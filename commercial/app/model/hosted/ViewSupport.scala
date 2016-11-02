package commercial.model.hosted

import conf.Configuration.site.host
import play.api.mvc.RequestHeader

object ViewSupport {

  def origin(host: String): Option[String] = {
    if (host.isEmpty) None
    else {
      val hostWithoutScheme = host.replaceFirst("https?://", "")
      Some(s"https://$hostWithoutScheme")
    }
  }

  def youtubeEmbedUrl(youtubeId: String)(implicit request: RequestHeader): String = {
    val baseUrl = s"https://www.youtube.com/embed/$youtubeId?modestbranding=1&showinfo=0&rel=0&enablejsapi=1"
    origin(host).map(o => s"$baseUrl&origin=$o") getOrElse baseUrl
  }
}
