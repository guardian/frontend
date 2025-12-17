package services
import services.newsletters.NewsletterSignupAgent
import services.newsletters.model.NewsletterResponseV2
import common._
import model.{ArticlePage, LiveBlogPage, PageWithStoryPackage, Tag}

import scala.concurrent.ExecutionContext.Implicits.global
import play.api.libs.json.{Json, OWrites, Reads}
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
    illustrationCard: Option[String],
)

object NewsletterData {
  implicit val newsletterDataReads: Reads[NewsletterData] = Json.reads[NewsletterData]
  implicit val newsletterDataWrites: OWrites[NewsletterData] = Json.writes[NewsletterData]
}

class NewsletterService(newsletterSignupAgent: NewsletterSignupAgent) {
  private val EMBED_TAG_PREFIX = "campaign/email/"

  private def findNewsletterTag(tags: List[Tag]) = {
    tags.find(t => t.properties.tagType.equals(TagType.Campaign.name) && t.properties.id.startsWith(EMBED_TAG_PREFIX))
  }

  private def getNewsletterName(tag: Tag) = {
    tag.properties.id.stripPrefix(EMBED_TAG_PREFIX)
  }

  private def getNewsletterResponseFromTags(tags: List[Tag]): Option[NewsletterResponseV2] = {
    for {
      tag <- findNewsletterTag(tags)
      newsletterName = getNewsletterName(tag)
      newsletterEither = newsletterSignupAgent.getV2NewsletterByName(newsletterName)
      newsletter <- newsletterEither match {
        case Left(_)      => None
        case Right(value) => value
      }
    } yield {
      newsletter
    }
  }

  private def getNewsletterResponseFromSignUpPage(articleId: String): Option[NewsletterResponseV2] = {
    newsletterSignupAgent.getV2Newsletters() match {
      case Left(_)     => None
      case Right(list) =>
        list
          .filter(shouldInclude)
          .find(response => response.signupPage.nonEmpty && response.signupPage.get == "/" + articleId)
    }
  }

  private def isSignUpPage(articlePage: ArticlePage): Boolean = {
    articlePage.article.content.metadata.format match {
      case None         => false
      case Some(format) => format.design == NewsletterSignupDesign
    }
  }

  private def convertNewsletterResponseToData(response: NewsletterResponseV2): NewsletterData = {
    NewsletterData(
      response.identityName,
      response.name,
      response.theme,
      response.signUpEmbedDescription,
      response.frequency,
      response.listId,
      response.group,
      response.mailSuccessDescription.getOrElse("You are subscribed"),
      response.regionFocus,
      illustrationCard = Option.empty[String],
    )
  }

  private def shouldInclude(response: NewsletterResponseV2): Boolean = {
    !response.restricted && response.status == "live"
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
