package commercial.controllers

import conf.Configuration.commercial._
import model.Cached.WithoutRevalidationResult
import model.{CacheTime, Cached}
import play.api.mvc._

class PassbackController(val controllerComponents: ControllerComponents) extends BaseController {

  private val anHour = 3600

  private val SizePattern = """(\d{3})x(\d{2,3})""".r

  /*
   * To be called as src of an iframe where a passback will be served
   * when the original ad has been blocked for brand safety.
   */
  def renderIasPassback(size: String): Action[AnyContent] =
    Action { implicit request =>
      Cached(CacheTime(anHour))(WithoutRevalidationResult {
        size match {
          case SizePattern(width, height) =>
            Ok(
              views.html.passback(
                dfpNetworkId = dfpAccountId,
                adUnitName = s"$dfpAdUnitGuRoot/x-passback/ias",
                passbackTarget = "ias",
                width.toInt,
                height.toInt,
              ),
            )
          case _ =>
            NotFound
        }
      })
    }
}
