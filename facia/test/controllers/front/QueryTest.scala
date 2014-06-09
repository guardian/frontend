package controllers.front

import scala.concurrent.Future
import model.{Collection, Config}
import common.Edition
import common.editions.Uk
import org.scalatest.{Matchers, FlatSpec}
import test.Fake
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.time.{Millis, Seconds, Span}
import org.scalatest.mock.MockitoSugar
import org.mockito.Mockito._
import play.api.libs.ws.Response
import services.ParseCollection

class CustomException(message: String) extends Exception(message)

class FailingConfigQuery(id: String) {
  def getConfig(id: String): Future[Seq[Config]] = Future.failed(new CustomException("Config Failed"))
  def getCollection(id: String, config: Config, edition: Edition, isWarmedUp: Boolean): Future[Collection]
    = Future.successful(Collection(Nil, None))
}

class FailingCollectionQuery(id: String) {
  def getConfig(id: String): Future[Seq[Config]] = Future.successful(Seq(Config(id, None, None, None)))
  def getCollection(id: String, config: Config, edition: Edition, isWarmedUp: Boolean): Future[Collection]
    = Future.failed(new Throwable("Collection Failed"))
}

class TestParseCollection(httpStatusCode: Int, responseString: String = "{}") extends ParseCollection with MockitoSugar {
  val response = mock[Response]

  when(response.status) thenReturn httpStatusCode
  when(response.body) thenReturn responseString

  override def requestCollection(id: String) = Future.successful(response)
}

class QueryTest extends FlatSpec with Matchers with ScalaFutures {

  implicit val defaultPatience =
    PatienceConfig(timeout = Span(10, Seconds), interval = Span(500, Millis))

  ignore should "return Nil for 4xx responses" in Fake {
    val query = new TestParseCollection(403)
    whenReady(query.getCollection("uk", Config("uk", None, None, None), Uk)) { collection =>
      collection.items.length should be (0)
    }

    val query2 = new TestParseCollection(409)
    whenReady(query2.getCollection("uk", Config("uk", None, None, None), Uk)) { collection =>
      collection.items.length should be (0)
    }
  }

  ignore should "contain an exception for 5xx responses when warmed up" in Fake {
    val query = new TestParseCollection(500)
    intercept[Exception] {
      whenReady(query.getCollection("uk", Config("uk", None, None, None), Uk)){_=>}
    }
  }

  ignore should "contain Nil for 5xx responses when NOT warmed up" in Fake {
    val query = new TestParseCollection(501)
    whenReady(query.getCollection("uk", Config("uk", None, None, None), Uk)){collection =>
      collection.items.length should be (0)
    }
  }

  ignore should "return Nil for all other responses (3xx, 1xx)" in Fake {
    val query = new TestParseCollection(303)
    whenReady(query.getCollection("uk", Config("uk", None, None, None), Uk)) { collection =>
      collection.items.length should be (0)
    }

    val query2 = new TestParseCollection(100)
    whenReady(query2.getCollection("uk", Config("uk", None, None, None), Uk)) { collection =>
      collection.items.length should be (0)
    }

    val query3 = new TestParseCollection(201)
    whenReady(query3.getCollection("uk", Config("uk", None, None, None), Uk)) { collection =>
      collection.items.length should be (0)
    }
  }

  ignore should "return items for correct JSON" in Fake {
    val json = """{"id":"uk","live":[{"id":"world/2013/oct/10/guardian-nsa-spies"}],"lastUpdated":"2013-10-15T16:20:06.858+01:00","updatedBy":"Test","updatedEmail":"testing.test@guardian.co.uk","displayName":"Top Stories"}"""
    val query = new TestParseCollection(200, json)
    whenReady(query.getCollection("uk", Config("uk", None, None, None), Uk)) { collection =>
      collection.items.length should be (1)
      collection.items.head.url should be ("/world/2013/oct/10/guardian-nsa-spies")
      collection.displayName should be (Some("Top Stories"))
    }
  }
}
