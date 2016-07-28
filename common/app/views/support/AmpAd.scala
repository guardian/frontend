package views.support

import model.Tag
import model.Article
import play.api.libs.json.{JsObject, Json}

object AmpAd {
  private def grabLastFragmentOfId(items: Seq[Tag]) = {
    items.map { item =>
      if (item.id == "uk/uk") {
        item.id
      } else {
        val keyword = item.id.split("/").last
        keyword.replaceAll("""/[+s]+/g""", "-").toLowerCase()
      }
    }
  }

  def adTargetingJson(article: Article, uri: String, edition: String): JsObject = {
    Json.obj(
      "targeting" -> Json.obj(
        "url" -> uri,
        "edition" -> edition,
        "se" -> grabLastFragmentOfId(article.trail.tags.series).mkString(","),
        "ct" -> article.metadata.contentType,
        "p" -> "amp",
        "keywordIds" -> article.trail.tags.keywords.map(_.id).mkString(","),
        "k" -> grabLastFragmentOfId(article.trail.tags.keywords).mkString(","),
        "co" -> grabLastFragmentOfId(article.trail.tags.contributors).mkString(","),
        "bl" -> grabLastFragmentOfId(article.trail.tags.blogs).mkString(","),
        "authorIds" -> article.trail.tags.contributors.map(_.id).mkString(","),
        "section" -> article.metadata.sectionId
      )
    )
  }

  def buildDataSlot(article: Article): String = {
    val section = article.metadata.sectionId
    val contentType = article.metadata.contentType.toLowerCase

    s"/59666047/theguardian.com/$section/$contentType/amp"
  }
}
