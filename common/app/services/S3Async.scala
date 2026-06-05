package services

import com.gu.etagcaching.aws.s3.ObjectId
import common.GuLogging
import conf.Configuration
import play.api.libs.json.{JsError, JsSuccess, Json, Reads}
import services.S3.logS3ExceptionWithDevHint
import software.amazon.awssdk.core.async.AsyncResponseTransformer
import software.amazon.awssdk.services.s3.model.{GetObjectRequest, GetObjectResponse, NoSuchKeyException, S3Exception}
import utils.AWSv2

import scala.concurrent.{ExecutionContext, Future}
import scala.jdk.FutureConverters._
import scala.io.Codec

trait S3Async extends GuLogging {

  lazy val bucket = Configuration.aws.frontendStoreBucket

  lazy private val client = AWSv2.S3Async

  def handleS3Errors[T](key: String)(future: Future[T])(implicit ec: ExecutionContext): Future[T] = {
    val objectId = ObjectId(bucket, key)
    future.recoverWith {
      case e: NoSuchKeyException =>
        log.warn(s"not found at ${objectId.s3Uri}")
        Future.failed(e)
      case e: S3Exception =>
        logS3ExceptionWithDevHint(objectId, e)
        Future.failed(e)
    }
  }

  private def getResponse(
      key: String,
  )(implicit codec: Codec, ec: ExecutionContext): Future[(GetObjectResponse, String)] = {
    val request = GetObjectRequest.builder().bucket(bucket).key(key).build()
    val responseFutureJava = client.getObject(request, AsyncResponseTransformer.toBytes[GetObjectResponse]())

    responseFutureJava.asScala.map { responseBytes =>
      val objectResponse = responseBytes.response()
      log.debug(s"S3 got ${objectResponse.contentLength} bytes from $key")
      val content = new String(responseBytes.asByteArray(), codec.charSet)
      (objectResponse, content)
    }
  }

  def getObjectAsJson[T: Reads](key: String)(implicit ec: ExecutionContext): Future[T] = {
    val futureResponse = getResponse(key)(Codec.UTF8, ec).map(_._2).flatMap { jsonString =>
      val parsedJson = Json.parse(jsonString)

      parsedJson.validate[T] match {
        case JsSuccess(parsedObject, _) =>
          Future.successful(parsedObject)
        case JsError(errors) =>
          Future.failed(new RuntimeException(s"Failed to parse JSON for key $key. Errors: $errors"))
      }
    }

    handleS3Errors(key)(futureResponse)
  }
}
