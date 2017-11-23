package controllers.front

import common.Logging
import conf.Configuration
import conf.switches.Switches
import model.PressedPage
import play.api.libs.json.Json
import protocol.BinaryPressedPageProtocol
import services.{LegacyPressedPageService, PressedPageService}

import scala.concurrent.{ExecutionContext, Future}

trait FrontJsonFapi extends Logging with BinaryPressedPageProtocol {
  lazy val stage: String = Configuration.facia.stage.toUpperCase
  val bucketLocation: String

  def legacyPressedPageService: LegacyPressedPageService
  def pressedPageService: PressedPageService

  private def getAddressForPath(path: String, format: String): String = s"$bucketLocation/${path.replaceAll("""\+""", "%2B")}/fapi/pressed.v2.$format"

//  The function, 'get' will become very simple after testing is completed
//  def get(path: String)(implicit executionContext: ExecutionContext): Future[Option[PressedPage]] = errorLoggingF(s"FrontJsonFapi.get $path") {
//    pressedPageService.findPressedPage(getAddressForPath(path, "binary"))
//  }

  def get(path: String)(implicit executionContext: ExecutionContext): Future[Option[PressedPage]] = errorLoggingF(s"FrontJsonFapi.get $path") {

    def comparison(pressedBinary: Option[PressedPage], pressedJson: Option[PressedPage]) = Future {
      val binary = Json.toJson(pressedBinary)
      val json = Json.toJson(pressedJson)
      if (binary != json) {
        log.error(s"pressed comparison: Binary and json pressed fronts are not the same path, $path")
      } else {
        log.info(s"pressed comparison: Binary and json are identical for $path")
      }
    }

    def pressBinaryAndJson(): Future[Option[PressedPage]] = {
      val pressedBinaryF = pressedPageService.findPressedPage(getAddressForPath(path, "binary"))
      val pressedJsonF = legacyPressedPageService.get(getAddressForPath(path, "json"))
      for {
        pressedBinary <- pressedBinaryF
        pressedJson <- pressedJsonF
      } yield {
        comparison(pressedBinary, pressedJson)
        pressedBinary
      }
    }

    (Switches.FaciaPressBinaryPress.isSwitchedOn, Switches.FaciaPressJsonPress.isSwitchedOn) match {
      case (true, true) => pressBinaryAndJson()
      case (true, false) => pressedPageService.findPressedPage(getAddressForPath(path, "binary"))
      case _ => legacyPressedPageService.get(getAddressForPath(path, "json"))
    }
  }

}

class FrontJsonFapiLive(val pressedPageService: PressedPageService, val legacyPressedPageService: LegacyPressedPageService) extends FrontJsonFapi {
  override val bucketLocation: String = s"$stage/frontsapi/pressed/live"
}

class FrontJsonFapiDraft(val pressedPageService: PressedPageService, val legacyPressedPageService: LegacyPressedPageService) extends FrontJsonFapi {
  override val bucketLocation: String = s"$stage/frontsapi/pressed/draft"
}
