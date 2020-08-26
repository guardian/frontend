package controllers

import common.ImplicitControllerExecutionContext
import model.{ApplicationContext, Cached}
import model.Cached.RevalidatableResult
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

import scala.concurrent.duration._

class FontLoaderController(
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext {

  val defaultCacheDuration: Duration = 15.minutes

  def renderFontLoader(): Action[AnyContent] =
    Action { implicit request =>
      Cached(defaultCacheDuration)(
        RevalidatableResult.Ok(
          views.html.fontLoader(),
        ),
      )
    }

}
