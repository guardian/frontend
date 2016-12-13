package controllers

import common.ExecutionContexts
import model.{ApplicationContext, Cached}
import model.Cached.RevalidatableResult
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, Controller}
import staticpages.StaticPages
import scala.concurrent.duration._

class SignupPageController(wsClient: WSClient)(implicit context: ApplicationContext) extends Controller with ExecutionContexts {

  val defaultCacheDuration: Duration = 15.minutes

  def renderNewslettersPage() = Action { implicit request =>
      Cached(defaultCacheDuration)(RevalidatableResult.Ok(views.html.signup.newsletters(StaticPages.simpleNewslettersPage(request.path))))
   }

}
