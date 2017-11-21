package commercial.controllers

import model.{ApplicationContext, Cached}
import play.api.i18n.I18nSupport
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import services.S3
import conf.Configuration.commercial.adsTextObjectKey
import model.Cached.RevalidatableResult

import scala.concurrent.duration._

class AdsDotTextViewController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
  extends BaseController with I18nSupport {

  def renderTextFile(): Action[AnyContent] = Action { implicit request =>
    Cached(30.minutes)(RevalidatableResult.Ok(S3.get(adsTextObjectKey).getOrElse("")))
  }

}