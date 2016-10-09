package controllers.commercial

import common.ExecutionContexts
import implicits.Requests
import model.Cached
import model.Cached.RevalidatableResult
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, Controller}
import staticpages.StaticPages

import scala.concurrent.duration._

class SubscriberNumberPageController extends Controller with ExecutionContexts {
  val defaultCacheDuration: Duration = 15.minutes

  def renderSubscriberNumberPage = Action { implicit request =>
    Cached(defaultCacheDuration)(RevalidatableResult.Ok(views.html.subscriberNumberPage(StaticPages.subscriberNumberPage)))
  }
}
