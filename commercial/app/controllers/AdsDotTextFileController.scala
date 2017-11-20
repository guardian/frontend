package commercial.controllers

import model.{ApplicationContext, NoCache}
import play.api.i18n.I18nSupport
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import services.S3
import conf.Configuration.commercial.adsTextObjectKey

class AdsDotTextFileController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
  extends BaseController with I18nSupport {

  def renderTextFile(): Action[AnyContent] = Action { implicit request =>
    NoCache(Ok(S3.get(adsTextObjectKey).getOrElse("")))
  }

}