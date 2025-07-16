package services

import com.gu.etagcaching.aws.s3.ObjectId
import common.GuLogging
import conf.Configuration
import model.PressedPageType
import org.joda.time.DateTime
import services.S3.logS3ExceptionWithDevHint
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.model.ObjectCannedACL.{PRIVATE, PUBLIC_READ}
import software.amazon.awssdk.services.s3.model._
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest
import utils.AWSv2

import java.io._
import java.nio.charset.StandardCharsets.UTF_8
import java.time.Duration.ofMinutes
import java.time.Instant
import java.util.zip.GZIPOutputStream
import scala.io.{Codec, Source}

trait S3 extends GuLogging {

  lazy val bucket = Configuration.aws.frontendStoreBucket

  lazy private val client = AWSv2.S3Sync

  def handleS3Errors[T](key: String)(thunk: => T): Option[T] = {
    val objectId = ObjectId(bucket, key)
    try {
      Some(thunk)
    } catch {
      case e: NoSuchKeyException if e.statusCode == 404 =>
        log.warn(s"not found at ${objectId.s3Uri}")
        None
      case e: software.amazon.awssdk.services.s3.model.S3Exception =>
        logS3ExceptionWithDevHint(objectId, e)
        None
      case e: Exception =>
        throw e
    }
  }

  def get(key: String)(implicit codec: Codec): Option[String] = handleS3Errors(key)(getResponseAndContent(key)._2)

  def getPresignedUrl(key: String): Option[String] = handleS3Errors(key) {
    val presignRequest = GetObjectPresignRequest.builder
      .signatureDuration(ofMinutes(10))
      .getObjectRequest(GetObjectRequest.builder.bucket(bucket).key(key).build)
      .build()

    AWSv2.S3PresignerSync.presignGetObject(presignRequest).url.toExternalForm
  }

  private def toDateTime(instant: Instant): DateTime = new DateTime(instant.toEpochMilli)

  def getWithLastModified(key: String): Option[(String, DateTime)] = handleS3Errors(key) {
    val (resp, content) = getResponseAndContent(key)
    val lastModified = toDateTime(resp.lastModified())
    (content, lastModified)
  }

  private def getResponseAndContent(key: String)(implicit codec: Codec): (GetObjectResponse, String) = {
    val request = GetObjectRequest.builder().bucket(bucket).key(key).build()
    val resp = client.getObject(request)
    val objectResponse = resp.response()
    log.info(s"S3 got ${objectResponse.contentLength} bytes from $key")
    try {
      val content = Source.fromInputStream(resp).mkString
      (objectResponse, content)
    } finally {
      resp.close()
    }
  }

  def getLastModified(key: String): Option[DateTime] = handleS3Errors(key) {
    val request = HeadObjectRequest.builder().bucket(bucket).key(key).build()
    toDateTime(client.headObject(request).lastModified())
  }

  def putPublic(key: String, value: String, contentType: String): Unit = {
    put(key: String, value: String, contentType: String, PUBLIC_READ)
  }

  def putPrivate(key: String, value: String, contentType: String): Unit = {
    put(key: String, value: String, contentType: String, PRIVATE)
  }

  def putPrivateGzipped(key: String, value: String, contentType: String): Unit = {
    val os = new ByteArrayOutputStream()
    val gzippedStream = new GZIPOutputStream(os)
    gzippedStream.write(value.getBytes(UTF_8))
    gzippedStream.flush()
    gzippedStream.close()

    val request = PutObjectRequest
      .builder()
      .bucket(bucket)
      .key(key)
      .acl(PRIVATE)
      .cacheControl("no-cache,no-store")
      .contentType(contentType)
      .contentEncoding("gzip")
      .build()

    client.putObject(request, RequestBody.fromBytes(os.toByteArray))
  }

  private def put(key: String, value: String, contentType: String, accessControlList: ObjectCannedACL): Unit = {
    val request = PutObjectRequest
      .builder()
      .bucket(bucket)
      .key(key)
      .acl(accessControlList)
      .cacheControl("no-cache,no-store")
      .contentType(contentType)
      .build()

    client.putObject(request, RequestBody.fromString(value, UTF_8))
  }
}

object S3 extends S3 {
  def logS3ExceptionWithDevHint(s3ObjectId: ObjectId, e: Exception): Unit = {
    val errorMsg = s"Unable to fetch S3 object (${s3ObjectId.s3Uri})"
    val hintMsg = "Hint: your AWS credentials might be missing or expired. You can fetch new ones using Janus."
    log.error(errorMsg, e)
    println(errorMsg + " \n" + hintMsg)
  }
}

object S3FrontsApi extends S3 {

  override lazy val bucket: String = Configuration.aws.frontendStoreBucket
  lazy val stage: String = Configuration.facia.stage.toUpperCase
  val namespace = "frontsapi"
  lazy val location = s"$stage/$namespace"

  private def putFapiPressedJson(live: String, path: String, json: String, suffix: String): Unit =
    putPrivateGzipped(s"$location/pressed/$live/$path/fapi/pressed.v2$suffix.json", json, "application/json")

  def putLiveFapiPressedJson(path: String, json: String, pressedType: PressedPageType): Unit =
    putFapiPressedJson("live", path, json, pressedType.suffix)
  def putDraftFapiPressedJson(path: String, json: String, pressedType: PressedPageType): Unit =
    putFapiPressedJson("draft", path, json, pressedType.suffix)
}

object S3Archive extends S3 {
  override lazy val bucket: String =
    if (Configuration.environment.isNonProd) "aws-frontend-archive-code" else "aws-frontend-archive"
}

object S3ArchiveOriginals extends S3 {
  override lazy val bucket: String =
    if (Configuration.environment.isNonProd) "aws-frontend-archive-code-originals" else "aws-frontend-archive-originals"
}

object S3Skimlinks extends S3 {
  override lazy val bucket: String =
    Configuration.affiliateLinks.bucket.getOrElse(Configuration.aws.frontendStoreBucket)
}
