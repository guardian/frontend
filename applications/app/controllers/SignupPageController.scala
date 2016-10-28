package controllers

import common.ExecutionContexts
import model.{Cached}
import model.Cached.RevalidatableResult
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, Controller}
import staticpages.StaticPages
import scala.concurrent.duration._


class SignupPageController(wsClient: WSClient) extends Controller with ExecutionContexts {

  val defaultCacheDuration: Duration = 15.minutes

  def renderNewslettersPage() = Action { implicit request =>
      Cached(defaultCacheDuration)(RevalidatableResult.Ok(views.html.signup.newsletters(StaticPages.simpleNewslettersPage(request.path))))
   }

  def renderWeekendReadingPage() = Action { implicit request =>
      Cached(defaultCacheDuration)(RevalidatableResult.Ok(views.html.signup.weekendReading(StaticPages.simpleEmailSignupPage(request.path, "Sign up for Guardian weekend reading"))))
   }

}
