package views.support

import model.Tag
import model.Article
import play.api.libs.json.{JsObject, Json}

case class AmpAd(article: Article, uri: String, edition: String) {
  private def buildAdFlagsFromTags(items: Seq[Tag]) = {
    items.map { item =>
      if (item.id == "uk/uk") {
        item.id
      } else {
        val keyword = item.id.split("/").last
        keyword.replaceAll("""/[+s]+/g""", "-").toLowerCase()
      }
    }
  }

  def toJson(): JsObject = {
    Json.obj(
      "targeting" -> Json.obj(
        "url" -> uri,
        "edition" -> edition,
        "se" -> buildAdFlagsFromTags(article.trail.tags.series).mkString(","),
        "ct" -> article.metadata.contentType,
        "p" -> "amp",
        "keywordIds" -> article.trail.tags.keywords.map(_.id).mkString(","),
        "k" -> buildAdFlagsFromTags(article.trail.tags.keywords).mkString(","),
        "co" -> buildAdFlagsFromTags(article.trail.tags.contributors).mkString(","),
        "bl" -> buildAdFlagsFromTags(article.trail.tags.blogs).mkString(","),
        "authorIds" -> article.trail.tags.contributors.map(_.id).mkString(","),
        "section" -> article.metadata.sectionId
      )
    )
  }
}
case class AmpAdDataSlot(article: Article) {
  override def toString(): String = {
    val section = article.metadata.sectionId
    val contentType = article.metadata.contentType.toLowerCase

    s"/59666047/theguardian.com/$section/$contentType/amp"
  }
}
