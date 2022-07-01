package services
import services.newsletters.NewsletterSignupAgent
import services.newsletters.model.NewsletterResponse
import common._
import model.{ArticlePage, PageWithStoryPackage}

class NewsletterService(
  agent: NewsletterSignupAgent
) {

  def getNewsletterForArticle(article: ArticlePage):Option[NewsletterResponse] = {
    None
  }
}
