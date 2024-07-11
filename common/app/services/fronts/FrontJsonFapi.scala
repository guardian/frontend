package services.fronts

import com.gu.etagcaching.ETagCache
import com.gu.etagcaching.FreshnessPolicy.AlwaysWaitForRefreshedValue
import com.gu.etagcaching.aws.s3.ObjectId
import com.gu.etagcaching.aws.sdkv2.s3.S3ObjectFetching
import com.gu.etagcaching.aws.sdkv2.s3.response.Transformer.Bytes
import common.FaciaPressMetrics.{FrontDecodingLatency, FrontDownloadLatency, FrontNotModifiedDownloadLatency}
import common.GuLogging
import conf.Configuration
import metrics.DurationMetric.withMetrics
import model.{PressedPage, PressedPageType}
import play.api.libs.json.Json
import services.S3.logS3ExceptionWithDevHint
import services._
import software.amazon.awssdk.services.s3.model.S3Exception
import utils.AWSv2.S3Async

import java.util.zip.GZIPInputStream
import scala.concurrent.duration.DurationInt
import scala.concurrent.{ExecutionContext, Future}
import scala.util.Using

trait FrontJsonFapi extends GuLogging {
  implicit val executionContext: ExecutionContext
  lazy val stage: String = Configuration.facia.stage.toUpperCase
  val bucketLocation: String

  private def s3ObjectIdFor(path: String, prefix: String): ObjectId =
    ObjectId(
      S3.bucket,
      s"$bucketLocation/${path.replaceAll("""\+""", "%2B")}/fapi/pressed.v2$prefix.json",
    )

  private val pressedPageCache: ETagCache[ObjectId, PressedPage] = new ETagCache(
    S3ObjectFetching(S3Async, Bytes)
      .timing(
        successWith = FrontDownloadLatency.recordDuration,
        notModifiedWith = FrontNotModifiedDownloadLatency.recordDuration,
      )
      .thenParsing { bytes =>
        withMetrics(FrontDecodingLatency) {
          Using(new GZIPInputStream(bytes.asInputStream()))(Json.parse(_).as[PressedPage]).get
        }
      },
    AlwaysWaitForRefreshedValue,
    _.maximumSize(2000).expireAfterAccess(1.hour),
  )

  def get(path: String, pageType: PressedPageType): Future[Option[PressedPage]] =
    errorLoggingF(s"FrontJsonFapi.get $path") {
      val objectId = s3ObjectIdFor(path, pageType.suffix)
      pressedPageCache.get(objectId).recover { case s3Exception: S3Exception =>
        logS3ExceptionWithDevHint(objectId, s3Exception)
        None
      }
    }
}

class FrontJsonFapiLive(implicit val executionContext: ExecutionContext) extends FrontJsonFapi {
  override val bucketLocation: String = s"$stage/frontsapi/pressed/live"
}

class FrontJsonFapiDraft(implicit val executionContext: ExecutionContext) extends FrontJsonFapi {
  override val bucketLocation: String = s"$stage/frontsapi/pressed/draft"
}
