package services.fronts

import common.{FaciaPressMetrics, GuLogging}
import concurrent.{BlockingOperations, FutureSemaphore}
import conf.Configuration
import metrics.DurationMetric
import model.{PressedPage, PressedPageType}
import play.api.libs.json.Json
import services.S3

import scala.concurrent.{ExecutionContext, Future}

trait FrontJsonFapi extends GuLogging {
  lazy val stage: String = Configuration.facia.stage.toUpperCase
  val bucketLocation: String
  val parallelJsonPresses = 32
  val futureSemaphore = new FutureSemaphore(parallelJsonPresses)

  def blockingOperations: BlockingOperations

  private def getAddressForPath(path: String, prefix: String): String =
    s"$bucketLocation/${path.replaceAll("""\+""", "%2B")}/fapi/pressed.v2$prefix.json"

  def get(path: String, pageType: PressedPageType)(implicit
      executionContext: ExecutionContext,
  ): Future[Option[PressedPage]] =
    errorLoggingF(s"FrontJsonFapi.get $path") {
      pressedPageFromS3(getAddressForPath(path, pageType.suffix))
    }

  private def parsePressedPage(
      jsonStringOpt: Option[String],
  )(implicit executionContext: ExecutionContext): Future[Option[PressedPage]] =
    futureSemaphore.execute {
      blockingOperations.executeBlocking {
        jsonStringOpt.map { jsonString =>
          DurationMetric.withMetrics(FaciaPressMetrics.FrontDecodingLatency) {
            // This operation is run in the thread pool since it is very CPU intensive
            Json.parse(jsonString).as[PressedPage]
          }
        }
      }
    }

  private def loadPressedPageFromS3(path: String) =
    blockingOperations.executeBlocking {
      DurationMetric.withMetrics(FaciaPressMetrics.FrontDownloadLatency) {
        S3.getGzipped(path)
      }
    }

  private def pressedPageFromS3(
      path: String,
  )(implicit executionContext: ExecutionContext): Future[Option[PressedPage]] =
    errorLoggingF(s"FrontJsonFapi.pressedPageFromS3 $path") {
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
