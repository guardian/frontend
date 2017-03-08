package views.support.structuredData

import common.LinkTo
import controllers.LiveBlogPage
import org.joda.time.DateTime
import play.api.libs.json._
import play.api.mvc.RequestHeader
import views.support.Format

// Since Json-Ld has fields that start with the @ character I can't just marshall it from
// case classes which would be simpler. I've opted to construct the JsonValues manually. I
// could probably find a library for this, but this is actually pretty clean as-is

object LiveBlogPosting {

  def zulu(date: DateTime)(implicit request: RequestHeader): String = Format(date, "yyyy-MM-dd'T'HH:mm:ssZ")

  def apply(blog: LiveBlogPage)(implicit request: RequestHeader): JsValue = {

    val blocks = blog.currentPage.currentPage.blocks

    Json.obj(
      "@context" -> "http://schema.org",
      "@type" -> "LiveBlogPosting",
      "url" -> LinkTo(blog.article.metadata.url),
      "headline" -> blog.article.trail.headline,
      "description" -> blog.article.fields.trailText,
      "datePublished" -> zulu(blog.article.trail.webPublicationDate),
      "coverageStartTime" -> zulu(blog.article.trail.webPublicationDate),
      "coverageEndTime" -> zulu(blog.article.fields.lastModified),
      "dateModified" -> zulu(blog.article.fields.lastModified),
      "publisher" -> Organisation(),
      "liveBlogUpdate" -> Json.arr(blocks.map(
        block => BlogPosting(blog, block)
      ))
    ) ++ MainMedia(blog).getOrElse(Json.obj())


  }

}
