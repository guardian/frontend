package services
import services.newsletters.NewsletterSignupAgent
import services.newsletters.model.NewsletterResponse
import common._
import model.{ArticlePage, PageWithStoryPackage, LiveBlogPage, Tag}

import scala.concurrent.ExecutionContext.Implicits.global
import play.api.libs.json.Json
import com.gu.contentapi.client.utils.format.NewsletterSignupDesign

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
  private val EMBED_TAG_TYPE = "Campaign"

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
    var response = getNewsletterResponseFromTags(articlePage.article.tags.tags)

    // TODO: Remove this part when all sign up pages have the correct tag added
    if (response.isEmpty) {
      response = getNewsletterResponseFromSignUpPage(articlePage.article.metadata.id)
    }

    if (response.isEmpty || !shouldInclude(response.get)) {
      return None
    }
    Option(convertNewsletterResponseToData(response.get))
  }

  def getNewsletterForLiveBlog(blogPage: LiveBlogPage): Option[NewsletterData] = {
    val response = getNewsletterResponseFromTags(blogPage.article.tags.tags)
    if (response.isEmpty || !shouldInclude(response.get)) {
      return None
    }
    Option(convertNewsletterResponseToData(response.get))
  }
}
