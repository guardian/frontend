package services.newsletters
import model.ArticlePage
import model.NewsletterResponse
// TO DO - get the ArticlePage import working!

class NewsletterService(
  agent: NewsletterSignupAgent
) {

  def getNewsletterForArticle(article: ArticlePage):Option[NewsletterResponse] = {
    None
  }
}
