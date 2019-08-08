package commercial.controllers

import model.ApplicationContext
import play.api.i18n.I18nSupport
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

import conf.Static

class CmpDataController (val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
  extends BaseController with I18nSupport {
  def renderVendorlist(): Action[AnyContent] = Action {
    implicit request =>
      Redirect(Static("data/vendor/cmp_vendorlist.json" ))
  }
}
