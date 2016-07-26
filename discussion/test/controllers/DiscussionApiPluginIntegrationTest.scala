package controllers

import conf.Configuration
import discussion.{DiscussionApi, DiscussionApiLike}
import discussion.model.Comment
import org.scalatest._
import test.ConfiguredTestSuite

import scala.concurrent.{Await, Future}
import scala.language.postfixOps
import scala.concurrent.duration._
import play.api.libs.ws.{WS, WSClient}

@DoNotDiscover class DiscussionApiPluginIntegrationTest extends FlatSpecLike with Matchers with BeforeAndAfterAll with ConfiguredTestSuite {

  case class TestPlugin(val wsClient: WSClient) extends DiscussionApiLike {

    override def GET(url: String, headers: (String, String)*) = {
      headersReceived = Map(headers:_*)
      wsClient.url(testUrl).withRequestTimeout(1).get()
    }

    var headersReceived: Map[String,String] = Map.empty
    val testUrl = "http://test-url"

    override protected val apiRoot = Configuration.discussion.apiRoot
    override protected val clientHeaderValue: String = Configuration.discussion.apiClientHeader
  }

  val testPlugin = TestPlugin(wsClient)

  "DiscussionApiPlugin getJsonOrError " should "send GU-Client headers in GET request" in {

    val responseFuture: Future[Comment] = testPlugin.commentFor(0)

    Await.ready(responseFuture, 2 seconds)

    testPlugin.headersReceived.get("GU-Client") should be (Some("nextgen-dev"))
  }
}
