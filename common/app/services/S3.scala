package services

import java.io._
import java.util.zip.{GZIPInputStream, GZIPOutputStream}
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

import com.amazonaws.auth.AWSSessionCredentials
import com.amazonaws.services.s3.{AmazonS3, AmazonS3Client}
import com.amazonaws.services.s3.model.CannedAccessControlList.{Private, PublicRead}
import com.amazonaws.services.s3.model._
import com.amazonaws.util.StringInputStream
import common.GuLogging
import conf.Configuration
import model.PressedPageType
import org.joda.time.{DateTime, DateTimeZone}
import play.api.libs.ws.{WSClient, WSRequest}

import scala.io.{Codec, Source}

trait S3 extends GuLogging {

  lazy val bucket = Configuration.aws.frontendStoreBucket

  lazy val client: Option[AmazonS3] = Configuration.aws.credentials.map { credentials =>
    AmazonS3Client.builder
      .withCredentials(credentials)
      .withRegion(conf.Configuration.aws.region)
      .build()
  }

  private def withS3Result[T](key: String)(action: S3Object => T): Option[T] =
    client.flatMap { client =>
      try {

        val request = new GetObjectRequest(bucket, key)
        val result = client.getObject(request)
        log.info(s"S3 got ${result.getObjectMetadata.getContentLength} bytes from ${result.getKey}")

        // http://stackoverflow.com/questions/17782937/connectionpooltimeoutexception-when-iterating-objects-in-s3
        try {
          Some(action(result))
        } catch {
          case e: Exception =>
            throw e
        } finally {
          result.close()
        }
      } catch {
        case e: AmazonS3Exception if e.getStatusCode == 404 =>
          log.warn("not found at %s - %s" format (bucket, key))
          None
        case e: AmazonS3Exception =>
          val errorMsg = s"Unable to fetch S3 object (key: $key)"
          val hintMsg = "Hint: your AWS credentials might be missing or expired. You can fetch new ones using Janus."
          log.error(errorMsg, e)
          println(errorMsg + " \n" + hintMsg)
          None
        case e: Exception =>
          throw e
      }
    }

  def get(key: String)(implicit codec: Codec): Option[String] =
    withS3Result(key) { result =>
      Source.fromInputStream(result.getObjectContent).mkString
    }

  def getWithLastModified(key: String): Option[(String, DateTime)] =
    withS3Result(key) { result =>
      val content = Source.fromInputStream(result.getObjectContent).mkString
      val lastModified = new DateTime(result.getObjectMetadata.getLastModified)
      (content, lastModified)
    }

  def getLastModified(key: String): Option[DateTime] =
    withS3Result(key) { result =>
      new DateTime(result.getObjectMetadata.getLastModified)
    }

  def putPublic(key: String, value: String, contentType: String): Unit = {
    put(key: String, value: String, contentType: String, PublicRead)
  }

  def putPublic(key: String, file: File, contentType: String): Unit = {
    val request = new PutObjectRequest(bucket, key, file).withCannedAcl(PublicRead)
    client.foreach(_.putObject(request))
  }

  def putPrivate(key: String, value: String, contentType: String): Unit = {
    put(key: String, value: String, contentType: String, Private)
  }

  def putPrivateGzipped(key: String, value: String, contentType: String): Unit = {
    putGzipped(key, value, contentType, Private)
  }

  def getGzipped(key: String)(implicit codec: Codec): Option[String] =
    withS3Result(key) { result =>
      Source.fromInputStream(new GZIPInputStream(result.getObjectContent)).mkString
    }

  private def putGzipped(
      key: String,
      value: String,
      contentType: String,
      accessControlList: CannedAccessControlList,
  ): Unit = {
    lazy val request = {
      val metadata = new ObjectMetadata()

      metadata.setCacheControl("no-cache,no-store")
      metadata.setContentType(contentType)
      metadata.setContentEncoding("gzip")

      val valueAsBytes = value.getBytes("UTF-8")
      val os = new ByteArrayOutputStream()
      val gzippedStream = new GZIPOutputStream(os)
      gzippedStream.write(valueAsBytes)
      gzippedStream.flush()
      gzippedStream.close()

      metadata.setContentLength(os.size())

      new PutObjectRequest(bucket, key, new ByteArrayInputStream(os.toByteArray), metadata)
        .withCannedAcl(accessControlList)
    }

    try {
      client.foreach(_.putObject(request))
    } catch {
      case e: Exception =>
        throw e
    }
  }

  private def put(key: String, value: String, contentType: String, accessControlList: CannedAccessControlList): Unit = {
    val metadata = new ObjectMetadata()
    metadata.setCacheControl("no-cache,no-store")
    metadata.setContentType(contentType)
    metadata.setContentLength(value.getBytes("UTF-8").length)

    val request =
      new PutObjectRequest(bucket, key, new StringInputStream(value), metadata).withCannedAcl(accessControlList)

    try {
      client.foreach(_.putObject(request))
    } catch {
      case e: Exception =>
        throw e
    }
  }
}

object S3 extends S3

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
  def getHtml(path: String): Option[String] = get(path)
}

object S3ArchiveOriginals extends S3 {
  override lazy val bucket: String =
    if (Configuration.environment.isNonProd) "aws-frontend-archive-code-originals" else "aws-frontend-archive-originals"
}

object S3Skimlinks extends S3 {
  override lazy val bucket: String =
    Configuration.affiliateLinks.bucket.getOrElse(Configuration.aws.frontendStoreBucket)
}
