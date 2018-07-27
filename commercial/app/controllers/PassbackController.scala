package commercial.controllers

import conf.Configuration.commercial._
import model.Cached.WithoutRevalidationResult
import model.{CacheTime, Cached}
import play.api.mvc._

class PassbackController(val controllerComponents: ControllerComponents) extends BaseController {

  private val anHour = 3600

  private val sizePattern = """(\d\d\d)x(\d\d\d)""".r

  /*
   * To be called as src of an iframe where a passback will be served
   * when the original ad has been blocked for brand safety.
   */
  def renderIasPassback(size: String): Action[AnyContent] = Action { implicit request =>
    size match {
      case sizePattern(width, height) =>
        Cached(CacheTime(anHour))(
          WithoutRevalidationResult(
            Ok(
              views.html.passback(
                dfpNetworkId = dfpAccountId,
                adUnitName = s"$dfpAdUnitGuRoot/x-passback/ias",
                passbackTarget = "ias",
                width.toInt,
                height.toInt
              ))))
      case _ =>
        Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound))
    }
  }
}
