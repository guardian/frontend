package pages

import com.typesafe.scalalogging.LazyLogging
import controllers.ArticlePage
import html.HtmlPage
import html.HtmlPageHelpers._
import model.ApplicationContext
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments._

object ArticleHtmlPage extends HtmlPage[ArticlePage] with LazyLogging {
  def html(page: ArticlePage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: ArticlePage = page
    logger.info(s"### ${request.attrs}")
    val (header, content): (Html, Html) = page.article match {
      case article if article.isPhotoEssay => (photoEssayHeader(), photoEssayBody())
      case article if article.isImmersive => (immersiveGarnettHeader(), immersiveGarnettBody())
      case article if article.isDataComicCompatible =>
        (guardianHeaderHtml(), dataComicBody(page))
      case _ => (guardianHeaderHtml(), articleBodyGarnett(page))
    }

    StoryHtmlPage.html(
      header = header,
      content = content
    )
  }
}
