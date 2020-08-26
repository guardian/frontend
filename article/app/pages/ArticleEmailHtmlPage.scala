package pages

import html.HtmlPage
import model.{ApplicationContext, PageWithStoryPackage}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments.page.email.{body, head, htmlTag}
import views.html.fragments.email.{emailArticleBody, emailArticleCss}

object ArticleEmailHtmlPage extends HtmlPage[PageWithStoryPackage] {

  def html(
      page: PageWithStoryPackage,
  )(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: PageWithStoryPackage = page
    htmlTag(
      head(
        emailArticleCss(),
      ),
      body(
        emailArticleBody(),
      ),
    )
  }

}
