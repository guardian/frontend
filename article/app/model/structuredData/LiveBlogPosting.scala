package model.structuredData

import common.LinkTo
import model.Article
import model.liveblog._
import org.joda.time.DateTime
import play.api.libs.json._
import play.api.mvc.RequestHeader
import views.support.GuDateFormatLegacy

// Since Json-Ld has fields that start with the @ character I can't just marshall it from
// case classes which would be simpler. I've opted to construct the JsonValues manually. I
// could probably find a library for this, but this is actually pretty clean as-is

object LiveBlogPosting {

  def zulu(date: DateTime)(implicit request: RequestHeader): String = GuDateFormatLegacy(date, "yyyy-MM-dd'T'HH:mm:ssZ")

  def apply(blog: Article, blocks: Seq[BodyBlock])(implicit request: RequestHeader): JsValue = {

    Json.obj(
      "@context" -> "http://schema.org",
      "@type" -> "LiveBlogPosting",
      "url" -> LinkTo(blog.metadata.url),
      "headline" -> blog.trail.headline,
      "description" -> blog.fields.trailText,
      "datePublished" -> zulu(blog.trail.webPublicationDate),
      "coverageStartTime" -> zulu(blog.trail.webPublicationDate),
      "coverageEndTime" -> zulu(blog.fields.lastModified),
      "dateModified" -> zulu(blog.fields.lastModified),
      "publisher" -> Organisation(),
      "liveBlogUpdate" -> Json.arr(blocks.map(block => BlogPosting(blog, block))),
    ) ++ MainMedia(blog).getOrElse(Json.obj())

  }

}
