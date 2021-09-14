package pagepresser

import com.amazonaws.services.s3.model.{CannedAccessControlList, ObjectMetadata, PutObjectRequest}
import com.amazonaws.services.s3.{AmazonS3, AmazonS3Client}
import com.amazonaws.util.StringInputStream
import common.BadConfigurationException
import conf.Configuration

import java.util.zip.GZIPInputStream
import scala.io.Source
import scala.util.Try

trait ArchiveWriter {
  def writeRaw(path: String, html: String): Try[Unit]
  def writeClean(path: String, html: String): Try[Unit]
}

trait ArchiveReader {
  def readRaw(path: String): Try[String]
}

case class S3Archive() extends ArchiveWriter with ArchiveReader {
  val cleanBucket = if (Configuration.environment.isNonProd) "aws-frontend-archive-code" else "aws-frontend-archive"

  val rawBucket: String =
    if (Configuration.environment.isNonProd) "aws-frontend-archive-code-originals" else "aws-frontend-archive-originals"

  private[this] val client: AmazonS3 = {
    val credentials =
      Configuration.aws.credentials.getOrElse(throw new BadConfigurationException("AWS credentials are not configured"))

    AmazonS3Client.builder
      .withCredentials(credentials)
      .withRegion(conf.Configuration.aws.region)
      .build()
  }

  def writeRaw(path: String, html: String): Try[Unit] = write(rawBucket, path, html)
  def writeClean(path: String, html: String): Try[Unit] = write(cleanBucket, path, html)
  def readRaw(path: String): Try[String] = read(rawBucket, path)

  private[this] def read(bucket: String, path: String): Try[String] = {
    Try {
      val resp = client.getObject(bucket, path)
      Source.fromInputStream(new GZIPInputStream(resp.getObjectContent)).mkString
    }
  }

  private[this] def write(bucket: String, path: String, html: String) = {
    val metadata = new ObjectMetadata()
    metadata.setCacheControl("no-cache,no-store")
    metadata.setContentType("text/html")
    metadata.setContentLength(html.getBytes("UTF-8").length)

    val request =
      new PutObjectRequest(bucket, path, new StringInputStream(html), metadata)
        .withCannedAcl(CannedAccessControlList.PublicRead)

    Try(request).map(_ => ())
  }
}

trait Cleaner {
  def clean(html: String): String
}

object Presser {
  def press(archiver: ArchiveReader with ArchiveWriter, cleaner: Cleaner, path: String): Try[Unit] = {
    val page = "" // TODO fix

    for {
      _ <- archiver.writeRaw(path, page)
      _ <- archiver.writeClean(path, cleaner.clean(page))
    } yield ()
  }
}
