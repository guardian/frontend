package topmentions

import com.amazonaws.services.s3.model.{GetObjectRequest, S3Object}
import com.amazonaws.services.s3.{AmazonS3, AmazonS3Client}
import com.amazonaws.util.IOUtils
import common.GuLogging
import conf.Configuration
import play.api.libs.json.{JsError, JsSuccess, Json}

import scala.collection.JavaConverters._
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}
import TopMentionsResponse._

class TopMentionsS3Client extends GuLogging {
  lazy val bucket = Configuration.aws.topMentionsStoreBucket

  lazy val client: AmazonS3 =
    AmazonS3Client.builder
      .withCredentials(Configuration.aws.mandatoryCredentials)
      .withRegion(conf.Configuration.aws.region)
      .build()

  def getListOfKeys(): Future[List[String]] = {
    Try {
      val s3ObjectList = client.listObjects(bucket).getObjectSummaries().asScala.toList
      s3ObjectList.map(_.getKey)
    } match {
      case Success(value) =>
        log.info(s"got list of ${value.length} top mentions from S3")
        Future.successful(value)
      case Failure(exception) =>
        log.error(s"failed in getting the list of top mentions from S3 - ${exception.getMessage}")
        Future.failed(exception)
    }
  }

  def getObject(key: String): Future[TopMentionsSuccessResponse] = {
    Try {
      val request = new GetObjectRequest(bucket, key)
      val result = client.getObject(request)
      parse(result)
    } match {
      case Success(value) =>
        log.info(s"got topMentionResponse from S3 for key ${key}")
        Future.successful(value)
      case Failure(exception) =>
        log.error(s"failed in getting top mention from S3 - ${exception.getMessage}")
        Future.failed(exception)
    }
  }

  def parse(s3Object: S3Object) = {
    val json = Json.parse(asString(s3Object))
    Json.fromJson[TopMentionsSuccessResponse](json) match {
      case JsSuccess(topMentionResponse, __) =>
        log.debug(s"Parsed topMentionResponse from S3 for key ${s3Object.getKey}")
        topMentionResponse
      case JsError(errors) =>
        val errorPaths = errors.map { error => error._1.toString() }.mkString(",")
        log.error(s"Error parsing topMentionResponse from S3 for key ${s3Object.getKey} paths: ${errorPaths}")
        throw new TopMentionJsonParseException(
          s"could not parse S3 topMentionResponse from json for key ${s3Object.getKey}. Errors paths(s): $errors",
        )
    }
  }

  private def asString(s3Object: S3Object): String = {
    val s3ObjectContent = s3Object.getObjectContent
    try {
      IOUtils.toString(s3ObjectContent)
    } finally {
      s3ObjectContent.close()
    }
  }
}
