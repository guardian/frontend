package model.structuredData

import common.LinkTo
import model.Article
import model.liveblog.BodyBlock
import org.joda.time.DateTime
import play.api.libs.json.{JsValue, Json}
import play.api.mvc.RequestHeader
import views.support.Format

object BlogPosting {

  def zulu(date: DateTime)(implicit request: RequestHeader): String = Format(date, "yyyy-MM-dd'T'HH:mm:ssZ")

  def apply(blog: Article, block: BodyBlock)(implicit request: RequestHeader): JsValue = {

    def blockDate(block: BodyBlock) = block.publishedDate match {
      case Some(date) => zulu(date)
      case None => zulu(blog.trail.webPublicationDate)
    }

    def blockBody(block: BodyBlock): String = {
      if(block.bodyTextSummary.length < 1000){
        block.bodyTextSummary
      } else {
        block.bodyTextSummary.substring(0, 1000)
      }
    }

    def blockAuthor(blog: Article, block: BodyBlock): JsValue = {

      val name = block.contributors.headOption match {
        case Some(id) => blog.tags.tags.find(_.id == s"profile/$id").map{ contributorTag =>
          contributorTag.name
        }
        case None => None
      }

      name match {
        case Some(thing) => Json.obj("@type" -> "Person", "name" -> thing)
        case None => Json.obj("@id" -> "https://www.theguardian.com#publisher")
      }

    }

    Json.obj(
      "@type" -> "BlogPosting",
      "headline" -> block.title.getOrElse[String](blog.trail.headline),
      "author" -> blockAuthor(blog, block),
      "publisher" -> Json.obj("@id" -> "https://www.theguardian.com#publisher"),
      "url" -> LinkTo{blog.metadata.url+"?page=with:block-"+block.id+"#block-"+block.id},
      "datePublished" -> blockDate(block),
      "articleBody" -> blockBody(block)
    )

  }


}
