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

class CustomException(message: String) extends Exception(message)

class FakeParseConfig(response: Future[Seq[Config]]) extends ParseConfig {
  override def getConfig(id: String): Future[Seq[Config]] = response
}

class FakeParseCollection(response: Future[Collection]) extends ParseCollection {
  override def getCollection(id: String, config: Config, edition: Edition, isWarmedUp: Boolean): Future[Collection]
    = response
}

class FailingConfigQuery(id: String) extends Query(id, Uk) {
  override def getConfig(id: String): Future[Seq[Config]] = Future.failed(new CustomException("Config Failed"))
  override def getCollection(id: String, config: Config, edition: Edition, isWarmedUp: Boolean): Future[Collection]
    = Future.successful(Collection(Nil, None))
}

class FailingCollectionQuery(id: String) extends Query(id, Uk) {
  override def getConfig(id: String): Future[Seq[Config]] = Future.successful(Seq(Config(id, None, None)))
  override def getCollection(id: String, config: Config, edition: Edition, isWarmedUp: Boolean): Future[Collection]
    = Future.failed(new Throwable("Collection Failed"))
}

class CustomHttpCollectionQuery(httpStatusCode: Int, responseString: String = "{}") extends ParseCollection with MockitoSugar {
  val response = mock[Response]

  when(response.status) thenReturn httpStatusCode
  when(response.body) thenReturn responseString

  override def requestCollection(id: String) = Future.successful(response)
}

class CustomHttpConfigQuery(httpStatusCode: Int, responseString: String) extends ParseConfig with MockitoSugar {
  val response = mock[Response]

  when(response.status) thenReturn httpStatusCode
  when(response.body) thenReturn responseString

  override def requestConfig(id: String) = Future.successful(response)
}

class QueryTest extends FlatSpec with Matchers with ScalaFutures {

  implicit val defaultPatience =
    PatienceConfig(timeout = Span(10, Seconds), interval = Span(500, Millis))

  "Query" should "start with minimal contents depending on id" in Fake {
    def defaultTuple(id: String): (Config, Collection) =
      (Config(id, Some(FaciaDefaults.generateContentApiQuery(id)), None), Collection(Nil))

    val query = new FailingConfigQuery("uk")
    query.queryAgent() should be (Some(List(defaultTuple("uk"))))
    query.items should be (None)

    val query2 = new FailingConfigQuery("some/where")
    query2.queryAgent() should be (Some(List(defaultTuple("some/where"))))
    query2.items should be (None)
  }

  it should "not bubble up the exception in getting config" in Fake {
    val query = new FailingConfigQuery("uk")
    whenReady(query.getItems){l =>
      l.length should be (1)
      l.forall(_._2.isRight)
      l.forall(_._1.id == "uk")
    }
  }

  it should "not bubble up the exception in getting collection" in Fake {
    val query = new FailingCollectionQuery("uk")
    whenReady(query.getItems){l =>
      l.length should be (1)
      l.forall(_._2.isLeft)
      l.forall(_._1.id == "uk")
    }
  }

  "ParseCollection" should "return Nil for 4xx responses" in Fake {
    val query = new CustomHttpCollectionQuery(403)
    whenReady(query.getCollection("uk", Config("uk", None, None), Uk, isWarmedUp=true)) { collection =>
      collection.items.length should be (0)
    }

    val query2 = new CustomHttpCollectionQuery(409)
    whenReady(query2.getCollection("uk", Config("uk", None, None), Uk, isWarmedUp=true)) { collection =>
      collection.items.length should be (0)
    }
  }

  it should "contain an exception for 5xx responses when warmed up" in Fake {
    val query = new CustomHttpCollectionQuery(500)
    intercept[Exception] {
      whenReady(query.getCollection("uk", Config("uk", None, None), Uk, isWarmedUp=true)){_=>}
    }
  }

  it should "contain Nil for 5xx responses when NOT warmed up" in Fake {
    val query = new CustomHttpCollectionQuery(501)
    whenReady(query.getCollection("uk", Config("uk", None, None), Uk, isWarmedUp=false)){collection =>
      collection.items.length should be (0)
    }
  }

  it should "return Nil for all other responses (3xx, 1xx)" in Fake {
    val query = new CustomHttpCollectionQuery(303)
    whenReady(query.getCollection("uk", Config("uk", None, None), Uk, isWarmedUp=true)) { collection =>
      collection.items.length should be (0)
    }

    val query2 = new CustomHttpCollectionQuery(100)
    whenReady(query2.getCollection("uk", Config("uk", None, None), Uk, isWarmedUp=true)) { collection =>
      collection.items.length should be (0)
    }

    val query3 = new CustomHttpCollectionQuery(201)
    whenReady(query3.getCollection("uk", Config("uk", None, None), Uk, isWarmedUp=true)) { collection =>
      collection.items.length should be (0)
    }
  }

  it should "return items for correct JSON" in Fake {
    val json = """{"id":"uk","live":[{"id":"world/2013/oct/10/guardian-nsa-spies"}],"lastUpdated":"2013-10-15T16:20:06.858+01:00","updatedBy":"Test","updatedEmail":"testing.test@guardian.co.uk","displayName":"Top Stories"}"""
    val query = new CustomHttpCollectionQuery(200, json)
    whenReady(query.getCollection("uk", Config("uk", None, None), Uk, isWarmedUp=true)) { collection =>
      collection.items.length should be (1)
      collection.items.head.url should be ("/world/2013/oct/10/guardian-nsa-spies")
      collection.displayName should be (Some("Top Stories"))
    }
  }

  "ParseConfig" should "return Nil for nothing" in Fake {
    val parseConfig = new CustomHttpConfigQuery(200, "{}")
    whenReady(parseConfig.getConfig("uk")) { configSeq =>
      configSeq.length should be (0)
    }
  }

  it should "return Config from correct JSON" in Fake {
    val json = """[{"roleName":"Top stories","roleDescription":"Regular importance stories, unrelated","id":"uk/news/regular-stories","contentApiQuery":"?tag=type/gallery|type/article|type/video|type/sudoku&show-editors-picks=true&edition=UK&show-fields=headline,trail-text,liveBloggingNow,thumbnail,hasStoryPackage,wordcount,shortUrl&show-elements=all","displayName":"ABC"}]"""
    val parseConfig = new CustomHttpConfigQuery(200, json)
    whenReady(parseConfig.getConfig("uk")) { configSeq =>
      configSeq.length should be (1)
      configSeq.head.id should be ("uk/news/regular-stories")
      configSeq.head.displayName should be (Some("ABC"))
    }
  }
}
