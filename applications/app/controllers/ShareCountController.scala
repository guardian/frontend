package controllers

import common.{ExecutionContexts, JsonComponent, Logging}
import model.{ApplicationContext, CacheTime, Cached}
import play.api.mvc.{Action, Controller}
import services.FacebookGraphApi


class ShareCountController(facebookGraphAPI: FacebookGraphApi)(implicit context: ApplicationContext) extends Controller with Logging with ExecutionContexts {

  def fetch(path: String) = Action.async { implicit request =>
    facebookGraphAPI.shareCount(path).map { shareCount =>
      Cached(CacheTime.ShareCount) {
        JsonComponent(
          ("path", path),
          ("share_count", shareCount)
        )
      }
    }
  }
}
