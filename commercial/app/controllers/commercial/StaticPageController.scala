package controllers.commercial

import model.{MetaData, GuardianContentTypes, Cached, StandalonePage}
import play.api.mvc.{Action, Controller}

case class SubscriberNumberPage() extends StandalonePage {
  override val metadata: MetaData = MetaData.make(
    id = "subscriber-number-page",
    webTitle = "Subscriber number form",
    section = "global",
    contentType = GuardianContentTypes.NetworkFront,
    analyticsName = "subscriber-number-page",
    shouldGoogleIndex = false
  )
}

object StaticPageController extends Controller {

  def renderSubscriberNumberPage() = Action { implicit request =>
    Cached(60)(Ok(views.html.static.subscriberNumberPage(SubscriberNumberPage().metadata)))
  }
}
