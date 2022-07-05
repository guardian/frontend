package topics

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.{GetObjectRequest, S3Object}
import com.amazonaws.util.IOUtils
import common.GuLogging
import conf.Configuration
import model.{TopicsJsonParseException, TopicsApiResponse}
import play.api.libs.json.{JsError, JsSuccess, Json}
import services.S3
import topics.S3ObjectImplicits.RichS3Object
import model.TopicsApiResponse._

import scala.collection.JavaConverters._
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

trait TopicS3Client {
  def getListOfKeys(): Future[List[String]]
  def getObject(key: String): Future[TopicsApiResponse]
}

final class TopicS3ClientImpl extends TopicS3Client with S3 with GuLogging {
  lazy val optionalBucket: Option[String] = Configuration.aws.topMentionsStoreBucket

  def getListOfKeys(): Future[List[String]] = {
    getClient { client =>
      Try {
        val s3ObjectList = client.listObjects(getBucket).getObjectSummaries().asScala.toList
        s3ObjectList.map(_.getKey)
      } match {
        case Success(value) =>
          log.info(s"got list of ${value.length} topics from S3")
          Future.successful(value)
        case Failure(exception) =>
          log.error(s"failed in getting the list of topics from S3", exception)
          Future.failed(exception)
      }
    }
  }

  def getObject(key: String): Future[TopicsApiResponse] = {
    getClient { client =>
      Try {
        val request = new GetObjectRequest(getBucket, key)
        client.getObject(request).parseToTopicsApiResponse
      }.flatten match {
        case Success(value) =>
          log.info(s"got TopicsApiResponse from S3 for key ${key}")
          Future.successful(value)
        case Failure(exception) =>
          log.error(s"S3 retrieval failed for key ${key}", exception)
          Future.failed(exception)
      }
    }
  }

  private def getBucket() = {
    optionalBucket.getOrElse(
      throw new RuntimeException("topics bucket config is empty, make sure config parameter has value"),
    )
  }

  private def getClient[T](callS3: AmazonS3 => Future[T]) = {
    client
      .map { callS3(_) }
      .getOrElse(Future.failed(new RuntimeException("No client exists for TopicS3Client")))
  }
}

object S3ObjectImplicits {
  implicit class RichS3Object(s3Object: S3Object) extends GuLogging {
    def parseToTopicsApiResponse: Try[TopicsApiResponse] = {
      val json = Json.parse(asString(s3Object))

      Json.fromJson[TopicsApiResponse](json) match {
        case JsSuccess(topicsApiResponse, __) =>
          log.debug(s"Parsed TopicsApiResponse from S3 for key ${s3Object.getKey}")
          Success(topicsApiResponse)
        case JsError(errors) =>
          val errorPaths = errors.map { error => error._1.toString() }.mkString(",")
          log.error(s"Error parsing TopicsApiResponse from S3 for key ${s3Object.getKey} paths: ${errorPaths}")
          Failure(
            TopicsJsonParseException(
              s"could not parse S3 TopicsApiResponse json. Errors paths(s): $errors",
            ),
          )
      }
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
