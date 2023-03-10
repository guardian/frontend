package services

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.{GetObjectRequest, S3Object}
import com.amazonaws.util.IOUtils
import common.GuLogging
import play.api.libs.json.{JsError, JsSuccess, Json, Reads}

import scala.concurrent.Future
import scala.jdk.CollectionConverters._
import scala.reflect.ClassTag
import scala.util.{Failure, Success, Try}

trait S3Client[T] {
  def getListOfKeys(): Future[List[String]]

  def getObject(key: String)(implicit read: Reads[T]): Future[T]
}

class S3ClientImpl[T](optionalBucket: Option[String])(implicit genericType: ClassTag[T])
    extends S3Client[T]
    with S3
    with GuLogging {

  def getListOfKeys(): Future[List[String]] = {
    getClient { client =>
      Try {
        val s3ObjectList = client.listObjects(getBucket()).getObjectSummaries().asScala.toList
        s3ObjectList.map(_.getKey)
      } match {
        case Success(value) =>
          println(s"got list of ${value.length} $genericTypeName items from S3")
          Future.successful(value)
        case Failure(exception) =>
          log.error(s"failed in getting the list of $genericTypeName items from S3", exception)
          Future.failed(exception)
      }
    }
  }

  def getObject(key: String)(implicit read: Reads[T]): Future[T] = {
    getClient { client =>
      Try {
        val request = new GetObjectRequest(getBucket(), key)
        parseResponse(client.getObject(request))
      }.flatten match {
        case Success(value) =>
          log.info(s"got $genericTypeName response from S3 for key ${key}")
          Future.successful(value)
        case Failure(exception) =>
          log.error(s"S3 retrieval failed for $genericTypeName key ${key}", exception)
          Future.failed(exception)
      }
    }
  }

  private def getBucket() = {
    optionalBucket.getOrElse(
      throw new RuntimeException(s"bucket config is empty for $genericTypeName, make sure config parameter has value"),
    )
  }

  private def getClient[T](callS3: AmazonS3 => Future[T]) = {
    client
      .map { callS3(_) }
      .getOrElse(Future.failed(new RuntimeException("No client exists for S3Client")))
  }

  private def parseResponse(s3Object: S3Object)(implicit read: Reads[T]): Try[T] = {
    val json = Json.parse(asString(s3Object))

    Json.fromJson[T](json) match {
      case JsSuccess(response, __) =>
        log.debug(s"Parsed $genericTypeName response from S3 for key ${s3Object.getKey}")
        Success(response)
      case JsError(errors) =>
        val errorPaths = errors.map { error => error._1.toString() }.mkString(",")
        log.error(s"Error parsing $genericTypeName response from S3 for key ${s3Object.getKey} paths: ${errorPaths}")
        Failure(
          new Exception(
            s"could not parse S3 $genericTypeName response json. Errors paths(s): $errors",
          ),
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

  private def genericTypeName = genericType.runtimeClass.getSimpleName
}
