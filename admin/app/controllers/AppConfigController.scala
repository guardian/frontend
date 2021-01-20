package controllers

import common.{ImplicitControllerExecutionContext, GuLogging}
import model.{ApplicationContext, NoCache}
import play.api.libs.json.Json
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import services.ParameterStoreService

class AppConfigController(val controllerComponents: ControllerComponents, parameterStoreService: ParameterStoreService)(
    implicit context: ApplicationContext,
) extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  def renderAppConfig(): Action[AnyContent] =
    Action { implicit request =>
      NoCache(Ok(views.html.appConfig()))
    }

  def findParameter(key: String): Action[AnyContent] =
    Action.async { implicit request =>
      parameterStoreService.findParameterBySubstring(key).map { result =>
        NoCache(Ok(Json.toJson(result)))
      }
    }
}
