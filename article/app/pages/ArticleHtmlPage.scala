package pages

import controllers.ArticlePage
import html.HtmlPage
import model.ApplicationContext
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments.articleBody
import views.html.fragments.page._
import html.HtmlPageHelpers._

object ArticleHtmlPage extends HtmlPage[ArticlePage] {
  def html(page: ArticlePage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: ArticlePage = page

    val (header, content): (Html, Html) = page.article match {
      case article if (article.isPhotoEssay) => (photoEssayHeader(), articleBody(page))
      case article if (article.isExplore) => (exploreHeader(), exploreBody())
      case article if (article.isImmersive) => (immersiveHeader(), immersiveBody())
      case _ => (guardianHeaderHtml(), articleBody(page))
    }

    StoryHtmlPage.html(
      header = header,
      content = content
    )
  }
}
