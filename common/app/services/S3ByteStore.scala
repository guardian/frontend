package services

import java.io.ByteArrayInputStream

import com.amazonaws.auth.AWSCredentialsProvider
import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.services.s3.model.CannedAccessControlList.{Private, PublicRead}
import com.amazonaws.services.s3.model._
import common.Logging
import common.S3Metrics.S3ClientExceptionsMetric

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Future, blocking}
import scala.util.{Failure, Success, Try}

class S3ByteStore(bucket: String, credentials: AWSCredentialsProvider) extends Logging {

  lazy val client: AmazonS3Client = {
    val client = new AmazonS3Client(credentials)
    client.setEndpoint(AwsEndpoints.s3)
    client
  }

  private def withS3Result[T](key: String)(action: S3Object => T): Future[Option[T]] = Future {
    try {

      val request = new GetObjectRequest(bucket, key)

      val result = blocking {
        client.getObject(request)
      }

      // http://stackoverflow.com/questions/17782937/connectionpooltimeoutexception-when-iterating-objects-in-s3
      try {
        Some(action(result))
      } finally {
        result.close()
      }
    } catch {
      case e: AmazonS3Exception if e.getStatusCode == 404 => {
        log.warn("not found at %s - %s" format(bucket, key))
        None
      }
      case e: Exception => {
        S3ClientExceptionsMetric.increment()
        throw e
      }
    }
  }

  def get(key: String): Future[Option[Array[Byte]]] = try {
    withS3Result[Array[Byte]](key)(response => org.apache.commons.io.IOUtils.toByteArray(response.getObjectContent))
  }

  def putPublic(key: String, value: Array[Byte], contentType: String) = {
    put(key: String, value, contentType: String, PublicRead)
  }

  def putPrivate(key: String, value: Array[Byte], contentType: String) = {
    put(key: String, value, contentType: String, Private)
  }

  private def put(key: String, value: Array[Byte], contentType: String, accessControlList: CannedAccessControlList) = Future {

    val metadata = new ObjectMetadata()
    metadata.setCacheControl("no-cache,no-store")
    metadata.setContentType(contentType)
    metadata.setContentLength(value.length)

    val request = new PutObjectRequest(bucket, key, new ByteArrayInputStream(value), metadata).withCannedAcl(accessControlList)

    Try {
      blocking {
        client.putObject(request)
      }
    }

  }.flatMap {
    case Success(s) => Future.successful(s)
    case Failure(f) =>
      S3ClientExceptionsMetric.increment()
      Future.failed(f)
  }

}
