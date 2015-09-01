package controllers

import model.Cached
import com.gu.contentapi.client.{model => contentapi}
import common.ExecutionContexts
import crosswords.{CrosswordData, CrosswordPage}
import play.api.mvc.{Action, Controller}
import services.ContentApiGetters.withCrossword

import scala.concurrent.Future

class OfflinePage(crossword: CrosswordData, content: contentapi.Content) extends CrosswordPage(crossword, content) {
  override lazy val id: String = "offline-page"

  override lazy val webTitle: String = "Unable to connect to the Internet"
}

object WebAppController extends Controller with ExecutionContexts {

  def serviceWorker() = Action { implicit request =>
    Cached(3600) {
      if (conf.Switches.NotificationsSwitch.isSwitchedOn || conf.Switches.OfflinePageSwitch.isSwitchedOn) {
        Ok(templates.js.serviceWorker())
      } else {
        NotFound
      }
    }
  }

  def manifest() = Action {
    Cached(3600) { Ok(templates.js.webAppManifest()) }
  }

  def offlinePage() = Action.async { implicit request =>
    if (conf.Switches.OfflinePageSwitch.isSwitchedOn) {
      withCrossword("quick", 14127) { (crossword, content) =>
        Cached(60)(Ok(views.html.offlinePage(
          new OfflinePage(CrosswordData.fromCrossword(crossword), content))))
      }
    } else {
      Future(NotFound)
    }
  }
}
