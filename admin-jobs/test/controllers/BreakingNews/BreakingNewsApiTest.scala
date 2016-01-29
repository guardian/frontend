package controllers.BreakingNews

import common.ExecutionContexts
import org.joda.time.DateTime
import org.scalatest.{DoNotDiscover, Matchers, WordSpec}
import play.api.libs.json.{JsValue, Json}
import test.ConfiguredTestSuite

import scala.io.Codec

@DoNotDiscover class BreakingNewsApiTest extends WordSpec with Matchers with ExecutionContexts with ConfiguredTestSuite {

  trait MockS3DoNothing extends S3BreakingNews {
    override def get(key: String)(implicit codec: Codec): Option[String] = None
    override def getWithLastModified(key: String): Option[(String, DateTime)] = None
    override def getLastModified(key: String): Option[DateTime] = None
    override def putPublic(key: String, value: String, contentType: String) = Unit
    override def putPrivate(key: String, value: String, contentType: String) = Unit
    override def putPrivateGzipped(key: String, value: String, contentType: String) = Unit
  }

  object MockS3DoNothing extends MockS3DoNothing

  class FakeS3Exception(message: String) extends Exception(message: String)
  object MockS3ThrowException extends MockS3DoNothing {
    override def get(key: String)(implicit codec: Codec): Option[String] = {throw new FakeS3Exception("get: Something bad happened")}
    override def putPublic(key: String, value: String, contentType: String) = {throw new FakeS3Exception("put: Something bad happened")}
  }

  case class breakingNewsApiWith(s3Instance: S3BreakingNews) extends BreakingNewsApi {
    lazy val s3: S3BreakingNews = s3Instance
  }

  "Fetching Breaking News json file" when {
    "an exception is thrown while accessing S3" should {
      "throw the exception" in {
        an [Exception] should be thrownBy(breakingNewsApiWith(MockS3ThrowException).getBreakingNews)
      }
    }
    "empty content is fetched from S3" should {
      "throw an exception" in {
        an [Exception] should be thrownBy(breakingNewsApiWith(MockS3DoNothing).getBreakingNews)
      }
    }
    "non json content is fetched from S3" should {
      object MockS3GetNonJsonContent extends MockS3DoNothing {
        override def get(key: String)(implicit codec: Codec): Option[String] = { Some("This is not some json content!") }
      }
      "throw a JsonParseException" in {
        an [Exception] should be thrownBy(breakingNewsApiWith(MockS3GetNonJsonContent).getBreakingNews)
      }
    }
    "json content is fetched from S3" should {
      object MockS3GetJsonContent extends MockS3DoNothing {
        override def get(key: String)(implicit codec: Codec): Option[String] = { Some("""{"field": "value"}""") }
      }
      "return json" in {
        val result = breakingNewsApiWith(MockS3GetJsonContent).getBreakingNews
        result match {
          case Some(json) => json shouldBe an [JsValue]
          case _ => fail("A json value should have been returned")
        }
      }
    }
  }

  "Saving Breaking News json file" when {
    val validJson = Json.toJson("{}")
    "an exception is thrown while accessing S3" should {
      "throw the excpetion" in {
        an [Exception] should be thrownBy(breakingNewsApiWith(MockS3ThrowException).putBreakingNews(validJson))
      }
    }

    "S3 put was successful" should {
      "have not failed" in {
        noException should be thrownBy(breakingNewsApiWith(MockS3DoNothing).putBreakingNews(validJson))
      }
    }

  }
}
