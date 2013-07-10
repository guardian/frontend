package common

import conf.Configuration
import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.services.s3.model._
import com.amazonaws.services.s3.model.CannedAccessControlList.Private
import com.amazonaws.util.StringInputStream
import scala.io.Source

trait S3 extends Logging {

  lazy val bucket = Configuration.aws.bucket

  def client = {
    val client = new AmazonS3Client(Configuration.aws.credentials)
    client.setEndpoint("s3-eu-west-1.amazonaws.com")
    client
  }

  def get(key: String): Option[String] = try {
    val request = new GetObjectRequest(bucket, key)
    val result = client.getObject(request)
    val content = result.getObjectContent

    Some(Source.fromInputStream(content).mkString)
  } catch {
    case e: AmazonS3Exception if e.getStatusCode == 404 =>
      log.warn("not found at %s - %s" format(bucket, key))
      None
  } finally {
    client.shutdown()
  }

  def put(key: String, value: String, contentType: String) {
    val metadata = new ObjectMetadata()
    metadata.setCacheControl("no-cache,no-store")
    metadata.setContentType(contentType)

    val request = new PutObjectRequest(bucket, key, new StringInputStream(value), metadata).withCannedAcl(Private)

    client.putObject(request)
    client.shutdown()
  }
}

object S3 extends S3
