package services

import java.io._
import java.util.zip.GZIPOutputStream
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

import com.amazonaws.auth.AWSSessionCredentials
import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.services.s3.model.CannedAccessControlList.{Private, PublicRead}
import com.amazonaws.services.s3.model._
import com.amazonaws.util.StringInputStream
import common.Logging
import conf.Configuration
import org.joda.time.{DateTime, DateTimeZone}
import play.api.libs.ws.{WSClient, WSRequest}
import sun.misc.BASE64Encoder

import scala.io.{Codec, Source}

trait S3 extends Logging {

  lazy val bucket = Configuration.aws.bucket

  lazy val client: Option[AmazonS3Client] = Configuration.aws.credentials.map{ credentials =>
    val client = new AmazonS3Client(credentials)
    client.setEndpoint(AwsEndpoints.s3)
    client
  }

  private def withS3Result[T](key: String)(action: S3Object => T): Option[T] = client.flatMap { client =>
    try {

      val request = new GetObjectRequest(bucket, key)
      val result = client.getObject(request)
      log.info(s"S3 got ${result.getObjectMetadata.getContentLength} bytes from ${result.getKey}")

      // http://stackoverflow.com/questions/17782937/connectionpooltimeoutexception-when-iterating-objects-in-s3
      try {
        Some(action(result))
      }
      catch {
        case e: Exception =>
          throw e
      }
      finally {
        result.close()
      }
    } catch {
      case e: AmazonS3Exception if e.getStatusCode == 404 =>
        log.warn("not found at %s - %s" format(bucket, key))
        None
      case e: AmazonS3Exception =>
        val errorMsg = s"Unable to fetch S3 object (key: $key)"
        val hintMsg =   "Hint: your AWS credentials might be missing or expired. You can fetch new ones using Janus."
        log.error(errorMsg, e)
        println(errorMsg + " \n" + hintMsg)
        None
      case e: Exception =>
        throw e
    }
  }

  def get(key: String)(implicit codec: Codec): Option[String] = withS3Result(key) {
    result => Source.fromInputStream(result.getObjectContent).mkString
  }


  def getWithLastModified(key: String): Option[(String, DateTime)] = withS3Result(key) {
    result =>
      val content = Source.fromInputStream(result.getObjectContent).mkString
      val lastModified = new DateTime(result.getObjectMetadata.getLastModified)
      (content, lastModified)
  }

  def getLastModified(key: String): Option[DateTime] = withS3Result(key) {
    result => new DateTime(result.getObjectMetadata.getLastModified)
  }

  def putPublic(key: String, value: String, contentType: String) {
    put(key: String, value: String, contentType: String, PublicRead)
  }

  def putPublic(key: String, file: File, contentType: String): Unit = {
    val request = new PutObjectRequest(bucket, key, file).withCannedAcl(PublicRead)
    client.foreach(_.putObject(request))
  }

  def putPrivate(key: String, value: String, contentType: String) {
    put(key: String, value: String, contentType: String, Private)
  }

  def putPrivateGzipped(key: String, value: String, contentType: String) {
    putGzipped(key: String, value: String, contentType: String, Private)
  }

  private def putGzipped(key: String, value: String, contentType: String, accessControlList: CannedAccessControlList) {
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

      new PutObjectRequest(bucket, key, new ByteArrayInputStream(os.toByteArray), metadata).withCannedAcl(accessControlList)
    }

    try {
      client.foreach(_.putObject(request))
    } catch {
      case e: Exception =>
        throw e
    }
  }

  private def put(key: String, value: String, contentType: String, accessControlList: CannedAccessControlList) {
    val metadata = new ObjectMetadata()
    metadata.setCacheControl("no-cache,no-store")
    metadata.setContentType(contentType)
    metadata.setContentLength(value.getBytes("UTF-8").length)

    val request = new PutObjectRequest(bucket, key, new StringInputStream(value), metadata).withCannedAcl(accessControlList)

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

  override lazy val bucket = Configuration.aws.bucket
  lazy val stage = Configuration.facia.stage.toUpperCase
  val namespace = "frontsapi"
  lazy val location = s"$stage/$namespace"

  def getLivePressedKeyForPath(path: String): String =
    s"$location/pressed/live/$path/pressed.json"

  def getDraftPressedKeyForPath(path: String): String =
    s"$location/pressed/draft/$path/pressed.json"

  def getLiveFapiPressedKeyForPath(path: String): String =
    s"$location/pressed/live/$path/fapi/pressed.json"

  def getDraftFapiPressedKeyForPath(path: String): String =
    s"$location/pressed/draft/$path/fapi/pressed.json"

  def putLivePressedJson(path: String, json: String): Unit =
    putPrivateGzipped(getLivePressedKeyForPath(path), json, "application/json")

  def putDraftPressedJson(path: String, json: String): Unit =
    putPrivateGzipped(getDraftPressedKeyForPath(path), json, "application/json")

  def putLiveFapiPressedJson(path: String, json: String): Unit =
    putPrivateGzipped(getLiveFapiPressedKeyForPath(path), json, "application/json")

  def putDraftFapiPressedJson(path: String, json: String): Unit =
    putPrivateGzipped(getDraftFapiPressedKeyForPath(path), json, "application/json")

  def getPressedLastModified(path: String): Option[String] =
    getLastModified(getLiveFapiPressedKeyForPath(path)).map(_.toString)
}

class SecureS3Request(wsClient: WSClient) extends implicits.Dates with Logging {
  val algorithm: String = "HmacSHA1"
  lazy val frontendBucket: String = Configuration.aws.bucket
  lazy val frontendStore: String = Configuration.frontend.store

  def urlGet(id: String): WSRequest = url("GET", id)

  private def url(httpVerb: String, id: String): WSRequest = {

    val headers = Configuration.aws.credentials.map(_.getCredentials).map{ credentials =>
      val sessionTokenHeaders: Seq[(String, String)] = credentials match {
        case sessionCredentials: AWSSessionCredentials => Seq("x-amz-security-token" -> sessionCredentials.getSessionToken)
        case _ => Nil
      }

      val date = DateTime.now(DateTimeZone.UTC).toString("yyyyMMdd'T'HHmmss'Z'")
      val signedString = signAndBase64Encode(generateStringToSign(httpVerb, id, date, sessionTokenHeaders), credentials.getAWSSecretKey)

      Seq(
        "Date" -> date,
        "Authorization" -> s"AWS ${credentials.getAWSAccessKeyId}:$signedString"
      ) ++ sessionTokenHeaders

    }.getOrElse(Seq.empty[(String, String)])



    wsClient.url(s"$frontendStore/$id").withHeaders(headers:_*)
  }

  //Other HTTP verbs may need other information such as Content-MD5 and Content-Type
  //If we move to AWS Security Token Service, we will need x-amz-security-token
  private def generateStringToSign(httpVerb: String, id: String, date: String, headers: Seq[(String, String)]): String = {
    //http://docs.aws.amazon.com/AmazonS3/latest/dev/RESTAuthentication.html#RESTAuthenticationConstructingCanonicalizedAmzHeaders
    val headerString = headers.map{ case (name, value) => s"${name.trim.toLowerCase}:${value.trim}\n" }.mkString
    //http://docs.aws.amazon.com/AmazonS3/latest/dev/RESTAuthentication.html
    s"$httpVerb\n\n\n$date\n$headerString/$frontendBucket/$id"
  }


  private def signAndBase64Encode(stringToSign: String, secretKey: String): String = {
    try {
      val mac: Mac = Mac.getInstance(algorithm)
      mac.init(new SecretKeySpec(secretKey.getBytes("UTF-8"), algorithm))
      val signature: Array[Byte] = mac.doFinal(stringToSign.getBytes("UTF-8"))
      val encoded: String = new BASE64Encoder().encode(signature)
      encoded
    } catch {
      case e: Throwable => log.error("Unable to calculate a request signature: " + e.getMessage, e)
      "Invalid"
    }
  }
}

object S3Archive extends S3 {
 override lazy val bucket = if (Configuration.environment.isNonProd) "aws-frontend-archive-code" else "aws-frontend-archive"
 def getHtml(path: String): Option[String] = get(path)
}

object S3Infosec extends S3 {
  override lazy val bucket = "aws-frontend-infosec"
  val key = "blocked-email-domains.txt"
  def getBlockedEmailDomains: Option[String] = get(key)
}

object S3ArchiveOriginals extends S3 {
  override lazy val bucket = if (Configuration.environment.isNonProd) "aws-frontend-archive-code-originals" else "aws-frontend-archive-originals"
}
