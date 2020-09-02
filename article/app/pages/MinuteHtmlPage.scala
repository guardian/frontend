package pages

import controllers.MinutePage
import html.HtmlPage
import model.ApplicationContext
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments.{immersiveGarnettHeader, minuteBody}

object MinuteHtmlPage extends HtmlPage[MinutePage] {

  def html(page: MinutePage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: MinutePage = page
    StoryHtmlPage.html(
      header = immersiveGarnettHeader(),
      content = minuteBody(page),
    )
  }

}
