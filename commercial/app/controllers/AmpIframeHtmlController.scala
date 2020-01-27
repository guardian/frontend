package commercial.controllers

import conf.Static
import model.ApplicationContext
import play.api.i18n.I18nSupport
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

class AmpIframeHtmlController (val controllerComponents: ControllerComponents) (implicit context: ApplicationContext)
  extends BaseController with I18nSupport {

  def renderAmpIframeHtml(): Action[AnyContent] = Action {
    implicit request =>
      Redirect(Static("data/vendor/amp-iframe.html"))
  }

}
