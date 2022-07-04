package services
import services.newsletters.NewsletterSignupAgent
import services.newsletters.model.NewsletterResponse
import common._
import model.{ArticlePage, PageWithStoryPackage, LiveBlogPage, Tag}

import scala.concurrent.ExecutionContext.Implicits.global

class NewsletterService(newsletterSignupAgent: NewsletterSignupAgent) {
  private val EMBED_TAG_PREFIX = "newsletter-embed"

  private def getNewsletterTag(tags: List[Tag]) = {
    tags.find(t => t.properties.id.contains(EMBED_TAG_PREFIX))
  }

  private def getNewsletterName(tag: Tag) = {
    tag.properties.id.stripPrefix(EMBED_TAG_PREFIX.+("-"))
  }

  def getNewsletterForArticle(articlePage: ArticlePage): Option[NewsletterResponse] = {

    for {
      tag <- getNewsletterTag((articlePage.article.tags.tags))
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
  def getNewsletterForLiveBlog(blogPage: LiveBlogPage): Option[NewsletterResponse] = {
    for {
      tag <- getNewsletterTag((blogPage.article.tags.tags))
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
}
