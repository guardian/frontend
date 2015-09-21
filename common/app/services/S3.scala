package services

import com.gu.googleauth.UserIdentity
import com.gu.pandomainauth.model.User
import conf.{Switches, Configuration}
import common.Logging
import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.services.s3.model._
import com.amazonaws.services.s3.model.CannedAccessControlList.{Private, PublicRead}
import com.amazonaws.util.StringInputStream
import scala.io.{Codec, Source}
import org.joda.time.DateTime
import play.Play
import play.api.libs.ws.{WSRequest, WS}
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import sun.misc.BASE64Encoder
import com.amazonaws.auth.AWSSessionCredentials
import common.S3Metrics.S3ClientExceptionsMetric
import com.gu.googleauth.UserIdentity
import java.util.zip.GZIPOutputStream
import java.io._

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

      // http://stackoverflow.com/questions/17782937/connectionpooltimeoutexception-when-iterating-objects-in-s3
      try {
        Some(action(result))
      }
      catch {
        case e: Exception =>
          S3ClientExceptionsMetric.increment()
          throw e
      }
      finally {
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
        S3ClientExceptionsMetric.increment()
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
        S3ClientExceptionsMetric.increment()
        throw e
    }
  }
}

object S3 extends S3

object S3FrontsApi extends S3 {

  override lazy val bucket = Configuration.aws.bucket
  lazy val stage = if (Play.isTest) "TEST" else Configuration.facia.stage.toUpperCase
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

  def getSchema = get(s"$location/schema.json")
  def getMasterConfig: Option[String] = get(s"$location/config/config.json")
  def getBlock(id: String) = get(s"$location/collection/$id/collection.json")

  private def getListing(prefix: String, dropText: String): List[String] = {
    import scala.collection.JavaConversions._
    val summaries = client.map(_.listObjects(bucket, prefix).getObjectSummaries.toList).getOrElse(Nil)
    summaries
      .map(_.getKey.split(prefix))
      .filter(_.nonEmpty)
      .map(_.last)
      .filterNot(_.endsWith("/"))
      .map(_.split(dropText).head)
  }

  def getConfigIds(prefix: String): List[String] = getListing(prefix, "/config.json")
  def getCollectionIds(prefix: String): List[String] = getListing(prefix, "/collection.json")

  def putLivePressedJson(path: String, json: String) =
    putPrivateGzipped(getLivePressedKeyForPath(path), json, "application/json")

  def putDraftPressedJson(path: String, json: String) =
    putPrivateGzipped(getDraftPressedKeyForPath(path), json, "application/json")

  def putLiveFapiPressedJson(path: String, json: String) =
    putPrivateGzipped(getLiveFapiPressedKeyForPath(path), json, "application/json")

  def putDraftFapiPressedJson(path: String, json: String) =
    putPrivateGzipped(getDraftFapiPressedKeyForPath(path), json, "application/json")

  def getPressedLastModified(path: String): Option[String] =
    getLastModified(getLiveFapiPressedKeyForPath(path)).map(_.toString)
}

trait SecureS3Request extends implicits.Dates with Logging {
  import play.api.Play.current
  val algorithm: String = "HmacSHA1"
  val frontendBucket: String = Configuration.aws.bucket
  val frontendStore: String = Configuration.frontend.store

  def urlGet(id: String): WSRequest = url("GET", id)

  private def url(httpVerb: String, id: String): WSRequest = {

    val headers = Configuration.aws.credentials.map(_.getCredentials).map{ credentials =>
      val sessionTokenHeaders: Seq[(String, String)] = credentials match {
        case sessionCredentials: AWSSessionCredentials => Seq("x-amz-security-token" -> sessionCredentials.getSessionToken)
        case _ => Nil
      }

      val date = DateTime.now.toHttpDateTimeString
      val signedString = signAndBase64Encode(generateStringToSign(httpVerb, id, date, sessionTokenHeaders), credentials.getAWSSecretKey)

      Seq(
        "Date" -> date,
        "Authorization" -> s"AWS ${credentials.getAWSAccessKeyId}:$signedString"
      ) ++ sessionTokenHeaders

    }.getOrElse(Seq.empty[(String, String)])



    WS.url(s"$frontendStore/$id").withHeaders(headers:_*)
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

object SecureS3Request extends SecureS3Request

object S3Archive extends S3 {
 override lazy val bucket = "aws-frontend-archive"
 def getHtml(path: String) = get(path)
}

object S3Infosec extends S3 {
  override lazy val bucket = "aws-frontend-infosec"
  val key = "blocked-email-domains.txt"
  def getBlockedEmailDomains = get(key)
}
