package controllers.front

import common.Logging
import conf.Configuration
import model.PressedPage
import services.PressedPageService
import scala.concurrent.{ExecutionContext, Future}

trait FrontJsonFapi extends Logging {
  lazy val stage: String = Configuration.facia.stage.toUpperCase
  val bucketLocation: String

  def pressedPageService: PressedPageService

  private def getAddressForPath(path: String, format: String): String = s"$bucketLocation/${path.replaceAll("""\+""", "%2B")}/fapi/pressed.v2.$format"

  def get(path: String)(implicit executionContext: ExecutionContext): Future[Option[PressedPage]] = errorLoggingF(s"FrontJsonFapi.get $path") {
    pressedPageService.get(getAddressForPath(path, "json"))
  }

}

class FrontJsonFapiLive(val pressedPageService: PressedPageService) extends FrontJsonFapi {
  override val bucketLocation: String = s"$stage/frontsapi/pressed/live"
}

class FrontJsonFapiDraft(val pressedPageService: PressedPageService) extends FrontJsonFapi {
  override val bucketLocation: String = s"$stage/frontsapi/pressed/draft"
}
