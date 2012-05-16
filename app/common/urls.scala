package common

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, Tag => ApiTag, Section => ApiSection }
import play.api.mvc.Request

// NEVER FORGET - Just calling this SupportedUrl doesn't make it not UrlBuilder, y'know.
object SupportedUrl {
  def apply(c: ApiContent): String = if (isSupportedInApp(c)) "/%s" format c.id else c.webUrl
  def apply(t: ApiTag): String = "/%s" format t.id
  def apply(s: ApiSection): String = "/%s" format s.id

  private def isSupportedInApp(c: ApiContent) = c.isArticle
}

class Static(base: String) {
  private lazy val staticMappings: Map[String, String] = {
    val assetMaps = Resources("assetmaps") map { loadProperties }

    // You try to determine a precedence order here if you like...
    val keyCollisions = assetMaps.duplicateKeys
    if (!keyCollisions.isEmpty) {
      throw new RuntimeException("Assetmap collisions for: " + keyCollisions.toList.sorted.mkString(", "))
    }

    val unbased = assetMaps reduceLeft { _ ++ _ }
    unbased mapValues { base + _ }
  }

  def apply(path: String) = staticMappings(path)
}

object OriginDomain {
  def apply[A](request: Request[A]): Option[String] = request.headers.get("X-GU-OriginalServer")
}