package services
import services.newsletters.NewsletterSignupAgent
import services.newsletters.model.NewsletterResponseV2
import model.{ArticlePage, LiveBlogPage, Tag}

import play.api.libs.json.{Json, OWrites, Reads}
import com.gu.contentapi.client.utils.format.NewsletterSignupDesign
import com.gu.contentapi.client.model.v1.TagType

case class NewsletterData(
    identityName: String,
    name: String,
    theme: String,
    description: String,
    frequency: String,
    highlightCardTitle: Option[String],
    listId: Int,
    group: String,
    successDescription: String,
    regionFocus: Option[String],
    illustrationCard: Option[String],
    illustrationSquare: Option[String],
    exampleUrl: Option[String],
    category: String,
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
      identityName = response.identityName,
      name = response.name,
      theme = response.theme,
      description = response.signUpEmbedDescription,
      frequency = response.frequency,
      highlightCardTitle = response.highlightCardTitle,
      listId = response.listId,
      group = response.group,
      successDescription = response.mailSuccessDescription.getOrElse("You are subscribed"),
      regionFocus = response.regionFocus,
      illustrationCard = response.illustrationCard,
      illustrationSquare = response.illustrationSquare,
      exampleUrl = response.exampleUrl,
      category = response.category,
    )
  }

  private def shouldInclude(response: NewsletterResponseV2): Boolean = {
    !response.restricted && response.status == "live"
  }

  /** Look up newsletter data from a list of model.Tag objects. Used during facia-press to populate
    * PressedProperties.newsletterData. Returns Some(NewsletterData) only when the content has the
    * `info/newsletter-sign-up` tag AND a matching `campaign/email/[name]` tag resolves to a live newsletter.
    */
  def getNewsletterDataFromTags(tags: List[Tag]): Option[NewsletterData] = {
    val hasNewsletterSignUpTag = tags.exists(_.properties.id == "info/newsletter-sign-up")
    if (!hasNewsletterSignUpTag) None
    else
      getNewsletterResponseFromTags(tags).collect {
        case response if shouldInclude(response) => convertNewsletterResponseToData(response)
      }
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
