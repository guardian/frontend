package controllers.front

import common.Logging
import concurrent.{BlockingOperations, FutureSemaphore}
import conf.Configuration
import model.{FullType, LiteType, PressedPage}
import play.api.libs.json.Json
import services.S3

import scala.concurrent.{ExecutionContext, Future}

trait FrontJsonFapi extends Logging {
  lazy val stage: String = Configuration.facia.stage.toUpperCase
  val bucketLocation: String
  val parallelJsonPresses = 24
  val futureSemaphore = new FutureSemaphore(parallelJsonPresses)

  def blockingOperations: BlockingOperations

  private def getAddressForPath(path: String, prefix: String): String = s"$bucketLocation/${path.replaceAll("""\+""", "%2B")}/fapi/pressed.v2$prefix.json"

  def get(path: String)(implicit executionContext: ExecutionContext): Future[Option[PressedPage]] = errorLoggingF(s"FrontJsonFapi.get $path") {
    pressedPageFromS3(getAddressForPath(path, FullType.suffix))
  }

  def getLite(path: String)(implicit executionContext: ExecutionContext): Future[Option[PressedPage]] = errorLoggingF(s"FrontJsonFapi.getLite $path") {
    pressedPageFromS3(getAddressForPath(path, LiteType.suffix))
  }

  private def pressedPageFromS3(path: String)(implicit executionContext: ExecutionContext): Future[Option[PressedPage]] = errorLoggingF(s"FrontJsonFapi.pressedPageFromS3 $path") {
    futureSemaphore.execute {
      blockingOperations.executeBlocking {
        S3.getGzipped(path).map(Json.parse(_).as[PressedPage])
      }
    }
  }

}

class FrontJsonFapiLive(val blockingOperations: BlockingOperations) extends FrontJsonFapi {
  override val bucketLocation: String = s"$stage/frontsapi/pressed/live"
}

class FrontJsonFapiDraft(val blockingOperations: BlockingOperations) extends FrontJsonFapi {
  override val bucketLocation: String = s"$stage/frontsapi/pressed/draft"
}
