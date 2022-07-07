package services
import services.newsletters.NewsletterSignupAgent
import services.newsletters.model.NewsletterResponse
import common._
import model.{ArticlePage, PageWithStoryPackage, LiveBlogPage, Tag}

import scala.concurrent.ExecutionContext.Implicits.global
import play.api.libs.json.Json

case class NewsletterData(
    identityName: String,
    name: String,
    theme: String,
    description: String,
    frequency: String,
    listId: Int,
    group: String,
    successDescription: String,
)

object NewsletterData {
  implicit val newsletterDataReads = Json.reads[NewsletterData]
  implicit val newsletterDataWrites = Json.writes[NewsletterData]
}

class NewsletterService(newsletterSignupAgent: NewsletterSignupAgent) {
  private val EMBED_TAG_PREFIX = "newsletter-embed"

  private def getNewsletterTag(tags: List[Tag]) = {
    tags.find(t => t.properties.id.contains(EMBED_TAG_PREFIX))
  }

  private def getNewsletterName(tag: Tag) = {
    tag.properties.id.stripPrefix(EMBED_TAG_PREFIX.+("-"))
  }

  private def getNewsletterResponse(tags: List[Tag]): Option[NewsletterResponse] = {
    for {
      tag <- getNewsletterTag(tags)
      newsletterName = getNewsletterName(tag)
      newsletterEither = newsletterSignupAgent.getNewsletterByName(newsletterName)
      newsletter <- newsletterEither match {
        case Left(value)  => None
        case Right(value) => value
      }
    } yield {
      newsletter
    }
  }

  private def newsletterResponseToData(response: NewsletterResponse): NewsletterData = {
    new NewsletterData(
      response.identityName,
      response.name,
      response.theme,
      response.description,
      response.frequency,
      response.listId,
      response.group,
      response.emailEmbed.successDescription,
    )
  }

  private def shouldInclude(response: NewsletterResponse): Boolean = {
    !response.paused && !response.restricted
  }

  def getNewsletterForArticle(articlePage: ArticlePage): Option[NewsletterData] = {
    val response = getNewsletterResponse(articlePage.article.tags.tags)
    if (response.isEmpty || !shouldInclude(response.get)) {
      None
    }
    Option.apply(newsletterResponseToData(response.get))
  }

  def getNewsletterForLiveBlog(blogPage: LiveBlogPage): Option[NewsletterData] = {
    val response = getNewsletterResponse(blogPage.article.tags.tags)
    if (response.isEmpty || !shouldInclude(response.get)) {
      None
    }
    Option.apply(newsletterResponseToData(response.get))
  }
}
