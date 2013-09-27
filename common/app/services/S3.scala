package services

import conf.Configuration
import common.Logging
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

  private def withS3Result[T](key: String)(action: S3Object => T): Option[T] = try {
    val request = new GetObjectRequest(bucket, key)
    val result = client.getObject(request)
    Some(action(result))
  } catch {
    case e: AmazonS3Exception if e.getStatusCode == 404 =>
      log.warn("not found at %s - %s" format(bucket, key))
      None
  } finally {
    client.shutdown()
  }

  def get(key: String): Option[String] = try {
    withS3Result(key) {
      result => Source.fromInputStream(result.getObjectContent).mkString
    }
  }

  def getWithLastModified(key: String): Option[(String, DateTime)] = try {
    withS3Result(key) {
      result =>
        val content = Source.fromInputStream(result.getObjectContent).mkString
        val lastModified = new DateTime(result.getObjectMetadata.getLastModified)
        (content, lastModified)
    }
  }

  def getLastModified(key: String): Option[DateTime] = try {
    withS3Result(key) {
      result => new DateTime(result.getObjectMetadata.getLastModified)
    }
  }

  def putPublic(key: String, value: String, contentType: String) {
    put(key: String, value: String, contentType: String, PublicRead)
  }

  def putPrivate(key: String, value: String, contentType: String) {
    put(key: String, value: String, contentType: String, Private)
  }

  private def put(key: String, value: String, contentType: String, accessControlList: CannedAccessControlList) {
    val metadata = new ObjectMetadata()
    metadata.setCacheControl("no-cache,no-store")
    metadata.setContentType(contentType)

    val request = new PutObjectRequest(bucket, key, new StringInputStream(value), metadata).withCannedAcl(accessControlList)

    client.putObject(request)
    client.shutdown()
  }

  private def getListing(prefix: String, dropText: String): List[String] = {
    import scala.collection.JavaConversions._
    val summaries = client.listObjects(bucket, prefix).getObjectSummaries.toList
    summaries
      .map(_.getKey.split(prefix))
      .filter(_.nonEmpty)
      .map(_.last)
      .filterNot(_.endsWith("/"))
      .map(_.split(dropText).head)
  }

  def getConfigIds(prefix: String): List[String] = getListing(prefix, "/config.json")
  def getCollectionIds(prefix: String): List[String] = getListing(prefix, "/collection.json")
}

object S3 extends S3

object S3FrontsApi extends S3 {

  override lazy val bucket = Configuration.aws.bucket
  lazy val stage = Configuration.facia.stage.toUpperCase
  val namespace = "frontsapi"
  lazy val location = s"${stage}/${namespace}"


  def getSchema = get(s"${location}/schema.json")
  def getConfig(id: String) = get(s"${location}/config/${id}/config.json")
  def getBlock(id: String) = get(s"${location}/collection/${id}/collection.json")
  def listConfigsIds: List[String] = getConfigIds(s"$location/config/")
  def listCollectionIds: List[String] = getCollectionIds(s"$location/collection/")
  def putBlock(id: String, json: String) =
    putPublic(s"${location}/collection/${id}/collection.json", json, "application/json")

  def archive(id: String, json: String) = {
    val now = DateTime.now
    putPrivate(s"${location}/history/collection/${id}/${now.year.get}/${"%02d".format(now.monthOfYear.get)}/${"%02d".format(now.dayOfMonth.get)}/${now}.json", json, "application/json")
  }
}
