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
  private val EMBED_TAG_PREFIX = "campaign/callout/"
  private val EMBED_TAG_TYPE = "campaign"

  private def findNewsletterTag(tags: List[Tag]) = {
    tags.find(t => t.properties.tagType.equals(EMBED_TAG_TYPE) && t.properties.id.startsWith(EMBED_TAG_PREFIX))
  }

  private def getNewsletterName(tag: Tag) = {
    tag.properties.id.stripPrefix(EMBED_TAG_PREFIX)
  }

  private def getNewsletterResponseFromTags(tags: List[Tag]): Option[NewsletterResponse] = {
    for {
      tag <- findNewsletterTag(tags)
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

  private def convertNewsletterResponseToData(response: NewsletterResponse): NewsletterData = {
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
    val response = getNewsletterResponseFromTags(articlePage.article.tags.tags)
    if (response.isEmpty || !shouldInclude(response.get)) {
      return None
    }
    Option.apply(convertNewsletterResponseToData(response.get))
  }

  def getNewsletterForLiveBlog(blogPage: LiveBlogPage): Option[NewsletterData] = {
    val response = getNewsletterResponseFromTags(blogPage.article.tags.tags)
    if (response.isEmpty || !shouldInclude(response.get)) {
      return None
    }
    Option.apply(convertNewsletterResponseToData(response.get))
  }
}
