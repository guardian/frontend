package pages

import html.HtmlPage
import model.{ApplicationContext, PressedPage}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments.emailFrontBody
import views.html.fragments.page.email.{body, head, htmlTag}

object FrontEmailHtmlPage extends HtmlPage[PressedPage] {

  def html(page: PressedPage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: PressedPage = page
    htmlTag(
      head(
        Html(common.Assets.css.emailFront),
      ),
      body(
        emailFrontBody(),
      ),
    )
  }

}
