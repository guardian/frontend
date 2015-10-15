package controllers

import com.gu.contentapi.client.model.Crossword
import common.{Edition, ExecutionContexts, Logging}
import conf.LiveContentApi
import crosswords.CrosswordData
import model.{Cached, MetaData}
import play.api.mvc.{Action, Controller, RequestHeader, Result}

import scala.concurrent.Future

class OfflinePage(val crossword: CrosswordData) extends MetaData {
  lazy val id: String = "offline-page"
  lazy val section: String = ""
  lazy val analyticsName: String = id
  lazy val webTitle: String = "Unable to connect to the Internet"
}

object WebAppController extends Controller with ExecutionContexts with Logging {

  def serviceWorker() = Action { implicit request =>
    Cached(3600) {
      if (conf.switches.Switches.OfflinePageSwitch.isSwitchedOn) {
        Ok(templates.js.serviceWorker())
      } else {
        NotFound
      }
    }
  }

  def manifest() = Action {
    Cached(3600) { Ok(templates.js.webAppManifest()) }
  }


  protected def withCrossword(crosswordType: String, id: Int)(f: (Crossword) => Result)(implicit request: RequestHeader): Future[Result] = {
    LiveContentApi.getResponse(LiveContentApi.item(s"crosswords/series/quick", Edition(request)).showFields("all")).map { response =>
      val maybeCrossword = for {
        content <- response.results.headOption
        crossword <- content.crossword }
        yield f(crossword)
      maybeCrossword getOrElse InternalServerError("Crossword response from Content API invalid.")
    } recover { case e =>
      log.error("Content API query returned an error.", e)
      InternalServerError("Content API query returned an error.")
    }
  }

  def offlinePage() = Action.async { implicit request =>
    if (conf.switches.Switches.OfflinePageSwitch.isSwitchedOn) {
      withCrossword("quick", 14127) { crossword =>
        Cached(60)(Ok(views.html.offlinePage(
          new OfflinePage(CrosswordData.fromCrossword(crossword)))))
      }
    } else {
      Future(NotFound)
    }
  }
}
