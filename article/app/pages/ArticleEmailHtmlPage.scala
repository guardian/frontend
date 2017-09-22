package pages

import html.HtmlPage
import model.{ApplicationContext, PageWithStoryPackage}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments.{emailArticleBody, emailArticleCss}
import views.html.fragments.page.email.{body, head, htmlTag}

object ArticleEmailHtmlPage extends HtmlPage[PageWithStoryPackage] {

  def html(implicit page: PageWithStoryPackage, request: RequestHeader, applicationContext: ApplicationContext): Html = {
    htmlTag(
      head(
        emailArticleCss()
      ),
      body(
        emailArticleBody()
      )
    )
  }

}

