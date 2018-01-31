package controllers.front

import common.{FaciaPressMetrics, Logging, StopWatch}
import concurrent.{BlockingOperations, FutureSemaphore}
import conf.Configuration
import metrics.DurationMetric
import model.{FullType, LiteType, PressedPage}
import play.api.libs.json.Json
import services.S3

import scala.concurrent.{ExecutionContext, Future}

trait FrontJsonFapi extends Logging {
  lazy val stage: String = Configuration.facia.stage.toUpperCase
  val bucketLocation: String
  val parallelJsonPresses = 32
  val futureSemaphore = new FutureSemaphore(parallelJsonPresses)

  def blockingOperations: BlockingOperations

  private def getAddressForPath(path: String, prefix: String): String = s"$bucketLocation/${path.replaceAll("""\+""", "%2B")}/fapi/pressed.v2$prefix.json"

  def get(path: String)(implicit executionContext: ExecutionContext): Future[Option[PressedPage]] = errorLoggingF(s"FrontJsonFapi.get $path") {
    pressedPageFromS3(getAddressForPath(path, FullType.suffix))
  }

  def getLite(path: String)(implicit executionContext: ExecutionContext): Future[Option[PressedPage]] = errorLoggingF(s"FrontJsonFapi.getLite $path") {
    pressedPageFromS3(getAddressForPath(path, LiteType.suffix))
  }

  private def parsePressedPage(jsonStringOpt: Option[String]): Future[Option[PressedPage]] = futureSemaphore.execute {
    blockingOperations.executeBlocking {
      jsonStringOpt.map { jsonString =>
        DurationMetric.withMetrics(FaciaPressMetrics.FrontDecodingLatency) {
          Json.parse(jsonString).as[PressedPage]
        }
      }
    }
  }

  private def loadPressedPageFromS3(path: String) = blockingOperations.executeBlocking {
    DurationMetric.withMetrics(FaciaPressMetrics.FrontDownloadLatency) {
      S3.getGzipped(path)
    }
  }

  private def pressedPageFromS3(path: String)(implicit executionContext: ExecutionContext): Future[Option[PressedPage]] = errorLoggingF(s"FrontJsonFapi.pressedPageFromS3 $path") {
    for {
      s3FrontData <- loadPressedPageFromS3(path)
      pressedPage <- parsePressedPage(s3FrontData)
    } yield pressedPage
  }

}

class FrontJsonFapiLive(val blockingOperations: BlockingOperations) extends FrontJsonFapi {
  override val bucketLocation: String = s"$stage/frontsapi/pressed/live"
}

class FrontJsonFapiDraft(val blockingOperations: BlockingOperations) extends FrontJsonFapi {
  override val bucketLocation: String = s"$stage/frontsapi/pressed/draft"
}
