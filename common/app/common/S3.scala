package common

import conf.Configuration
import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.services.s3.model._
import com.amazonaws.services.s3.model.CannedAccessControlList.{Private, PublicRead}
import com.amazonaws.util.StringInputStream
import scala.io.Source
import org.joda.time.DateTime

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

  def put(key: String, value: String, contentType: String, accessControl: CannedAccessControlList = Private) {
    val metadata = new ObjectMetadata()
    metadata.setCacheControl("no-cache,no-store")
    metadata.setContentType(contentType)

    val request = new PutObjectRequest(bucket, key, new StringInputStream(value), metadata).withCannedAcl(accessControl)

    client.putObject(request)
    client.shutdown()
  }
}

object S3 extends S3

object S3FrontsApi extends S3 {

  override lazy val bucket = Configuration.aws.frontsApiBucket
  lazy val frontsKey = Configuration.aws.frontsKey

  def getSchema = get(s"${frontsKey}/schema.json")
  def getFront(edition: String, section: String) = get(s"${frontsKey}/${edition}/${section}/latest/latest.json")
  def putFront(edition: String, section: String, json: String) =
    put(s"${frontsKey}/${edition}/${section}/latest/latest.json", json, "application/json")


  def getBlock(edition: String, section: String, block: String) = get(s"${frontsKey}/${edition}/${section}/${block}/latest/latest.json")
  def putBlock(edition: String, section: String, block: String, json: String) =
    put(s"${frontsKey}/${edition}/${section}/${block}/latest/latest.json", json, "application/json", PublicRead)

  def archive(edition: String, section: String, block: String, json: String) = {
    val now = DateTime.now
    put(s"${frontsKey}/${edition}/${section}/${block}/history/${now.year.get}/${"%02d".format(now.monthOfYear.get)}/${"%02d".format(now.dayOfMonth.get)}/${now}.json", json, "application/json")
  }
}
