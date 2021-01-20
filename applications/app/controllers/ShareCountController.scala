package controllers

import common.{ImplicitControllerExecutionContext, JsonComponent, GuLogging}
import model.{ApplicationContext, CacheTime, Cached}
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import services.FacebookGraphApi

class ShareCountController(
    facebookGraphAPI: FacebookGraphApi,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  def fetch(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      facebookGraphAPI.shareCount(path).map { shareCount =>
        Cached(CacheTime.ShareCount) {
          JsonComponent(
            ("path", path),
            ("share_count", shareCount),
          )
        }
      }
    }
}
