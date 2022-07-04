package services
import services.newsletters.NewsletterSignupAgent
import services.newsletters.model.NewsletterResponse
import common._
import model.{ArticlePage, PageWithStoryPackage, LiveBlogPage}

import scala.concurrent.ExecutionContext.Implicits.global

class NewsletterService(newsletterSignupAgent: NewsletterSignupAgent) {

  def getNewsletterForArticle(article: ArticlePage): Option[NewsletterResponse] = {
    None
  }
  def getNewsletterForLiveBlog(blog: LiveBlogPage): Option[NewsletterResponse] = {
    None
  }
}
