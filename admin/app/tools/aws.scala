package tools

import common.Logging
import conf.{ Configuration, AdminConfiguration }
import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.services.s3.model._
import com.amazonaws.services.s3.model.CannedAccessControlList.PublicRead
import com.amazonaws.util.StringInputStream
import scala.io.Source


trait S3 extends Logging {

  lazy val bucket = Configuration.aws.bucket
  lazy val configKey = AdminConfiguration.configKey
  lazy val switchesKey = AdminConfiguration.switchesKey

  private def createClient = new AmazonS3Client(Configuration.aws.credentials)

  def getConfig = get(configKey)
  def putConfig(config: String) { put(configKey, config, "application/json") }

  def getSwitches = get(switchesKey)
  def putSwitches(config: String) { put(switchesKey, config, "text/plain") }

  protected def get(key: String): Option[String] = {
    val client = createClient
    val request = new GetObjectRequest(bucket, key)
    try{
      val s3object = client.getObject(request)
      Some(Source.fromInputStream(s3object.getObjectContent).mkString)
    } catch {
      case e: AmazonS3Exception if e.getStatusCode == 404 =>
        log.warn("not found at %s - %s" format(bucket, key))
        None
      case _: Throwable => None
    } finally {
      client.shutdown()
    }
  }

  protected def put(key: String, value: String, contentType: String) {
    val metadata = new ObjectMetadata()
    metadata.setCacheControl("no-cache,no-store")
    metadata.setContentType(contentType)
    val request = new PutObjectRequest(bucket, key, new StringInputStream(value), metadata)
      .withCannedAcl(PublicRead)
    val client = createClient
    client.putObject(request)
    client.shutdown()
  }
}

object S3 extends S3

object S3FrontsApi extends S3 {

  override lazy val bucket = Configuration.aws.frontsApiBucket
  lazy val frontsKey = AdminConfiguration.frontsKey

  def getFront(section: String) = get(s"${frontsKey}/${section}/latest/latest.json")

}
