package commercial.controllers

import model.{ApplicationContext, Cors}
import play.api.i18n.I18nSupport
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

import conf.Static

class CmpDataController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
    extends BaseController
    with I18nSupport {

  val cmpWhitelist = Seq("localhost", "thegulocal.com", "dev-theguardian.com", "theguardian.com")

  def renderVendorlist(): Action[AnyContent] =
    Action { implicit request =>
      Cors(Redirect(Static("data/vendor/cmp_vendorlist.json")), None, None, cmpWhitelist)
    }

  def renderShortVendorlist(): Action[AnyContent] =
    Action { implicit request =>
      Cors(Redirect(Static("data/vendor/cmp_shortvendorlist.json")), None, None, cmpWhitelist)
    }

}
