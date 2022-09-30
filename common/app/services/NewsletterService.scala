package services
import services.newsletters.NewsletterSignupAgent
import services.newsletters.model.NewsletterResponse
import common._
import model.{ArticlePage, PageWithStoryPackage, LiveBlogPage, Tag}

import scala.concurrent.ExecutionContext.Implicits.global
import play.api.libs.json.Json
import com.gu.contentapi.client.utils.format.NewsletterSignupDesign
import com.gu.contentapi.client.model.v1.TagType

case class NewsletterData(
    identityName: String,
    name: String,
    theme: String,
    description: String,
    frequency: String,
    listId: Int,
    group: String,
    successDescription: String,
    regionFocus: Option[String],
)

object NewsletterData {
  implicit val newsletterDataReads = Json.reads[NewsletterData]
  implicit val newsletterDataWrites = Json.writes[NewsletterData]
}

class NewsletterService(newsletterSignupAgent: NewsletterSignupAgent) {
  private val EMBED_TAG_PREFIX = "campaign/email/"

  private def findNewsletterTag(tags: List[Tag]) = {
    tags.find(t => t.properties.tagType.equals(TagType.Campaign.name) && t.properties.id.startsWith(EMBED_TAG_PREFIX))
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
        case Left(_)      => None
        case Right(value) => value
      }
    } yield {
      newsletter
    }
  }

  private def getNewsletterResponseFromSignUpPage(articleId: String): Option[NewsletterResponse] = {
    newsletterSignupAgent.getNewsletters() match {
      case Left(_) => None
      case Right(list) =>
        list.find(response => response.signupPage.nonEmpty && response.signupPage.get == "/" + articleId)
    }
  }

  private def isSignUpPage(articlePage: ArticlePage): Boolean = {
    articlePage.article.content.metadata.format match {
      case None         => false
      case Some(format) => format.design == NewsletterSignupDesign
    }
  }

  private def convertNewsletterResponseToData(response: NewsletterResponse): NewsletterData = {
    NewsletterData(
      response.identityName,
      response.name,
      response.theme,
      response.description,
      response.frequency,
      response.listId,
      response.group,
      response.emailEmbed.successDescription,
      response.regionFocus,
    )
  }

  private def shouldInclude(response: NewsletterResponse): Boolean = {
    !response.paused && !response.restricted
  }

  def getNewsletterForArticle(articlePage: ArticlePage): Option[NewsletterData] = {
    // Try retrieving newsletter data by matching a sign up tag to the newsletters response
    val maybeNewsletterFromTags = getNewsletterResponseFromTags(articlePage.article.tags.tags)

    val maybeNewsletter = maybeNewsletterFromTags match {
      case Some(newsletter) => if (shouldInclude(newsletter)) Some(newsletter) else None
      case None             =>
        // For sign up pages without a matching newsletter tag, try matching the article ID against the sign up page from newsletters API
        // N.B. This is for backwards compatibility, remove this part when all sign up pages have the correct tag added
        if (isSignUpPage(articlePage)) getNewsletterResponseFromSignUpPage(articlePage.article.metadata.id) else None
    }

    maybeNewsletter.map(convertNewsletterResponseToData)
  }

  def getNewsletterForLiveBlog(blogPage: LiveBlogPage): Option[NewsletterData] = {
    val maybeNewsletterFromTags = getNewsletterResponseFromTags(blogPage.article.tags.tags)

    val maybeNewsletter = maybeNewsletterFromTags flatMap { newsletter =>
      if (shouldInclude(newsletter)) Some(newsletter) else None
    }

    maybeNewsletter.map(convertNewsletterResponseToData)
  }
}
