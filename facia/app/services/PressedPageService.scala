package services

import common.Logging
import concurrent.{BlockingOperations, FutureSemaphore}
import model.PressedPage
import play.api.libs.json.Json
import scala.concurrent.{ExecutionContext, Future}

class PressedPageService(blockingOperations: BlockingOperations) extends Logging {
  val parallelJsonPresses = 16
  val futureSemaphore = new FutureSemaphore(parallelJsonPresses)

  def get(path: String)(implicit executionContext: ExecutionContext): Future[Option[PressedPage]] = errorLoggingF(s"PressedPageService.get $path") {
    futureSemaphore.execute {
      blockingOperations.executeBlocking {
        S3.getGzipped(path).map(Json.parse(_).as[PressedPage])
      }
    }
  }

}
