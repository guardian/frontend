package common

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, Tag => ApiTag }
import java.util.Properties
import java.net.URL

// NEVER FORGET - Just calling this SupportedUrl doesn't make it not UrlBuilder, y'know.
object SupportedUrl {
  def apply(c: ApiContent): String = if (isSupportedInApp(c)) "/%s" format c.id else c.webUrl
  def apply(t: ApiTag): String = "/%s" format t.id

  private def isSupportedInApp(c: ApiContent) = c.isArticle
}

class Static(base: String) {
  private lazy val staticMappings: Map[String, String] = {
    val assetMaps = Resources("assetmaps") map { loadAssetMap }
    assetMaps reduceLeft { _ ++ _ }
  }

  def apply(path: String) = base + staticMappings(path)

  private def loadAssetMap(url: URL): Map[String, String] = {
    val properties = new Properties()
    using(url.openStream) { properties.load }
    properties.toMap
  }
}