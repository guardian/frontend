package controllers

import conf.Configuration
import discussion.api.DiscussionApiLike
import discussion.model.Comment
import org.scalatest._
import org.scalatest.flatspec.AnyFlatSpecLike
import org.scalatest.matchers.should.Matchers
import test.{ConfiguredTestSuite, WithMaterializer, WithTestExecutionContext, WithTestWsClient}

import scala.concurrent.{Await, ExecutionContext, Future}
import scala.language.postfixOps
import scala.concurrent.duration._
import play.api.libs.ws.{WSClient, WSResponse}

@DoNotDiscover class DiscussionApiPluginIntegrationTest
    extends AnyFlatSpecLike
    with Matchers
    with BeforeAndAfterAll
    with ConfiguredTestSuite
    with WithMaterializer
    with WithTestExecutionContext
    with WithTestWsClient {

  class TestPlugin(val wsClient: WSClient) extends DiscussionApiLike {

    override def GET(url: String, headers: (String, String)*)(implicit
        executionContext: ExecutionContext,
    ): Future[WSResponse] = {
      headersReceived = Map(headers: _*)
      wsClient.url(testUrl).withRequestTimeout(1.millisecond).get()
    }

    var headersReceived: Map[String, String] = Map.empty
    val testUrl = "http://test-url"

    override protected val apiRoot = Configuration.discussion.apiRoot
    override protected val clientHeaderValue: String = Configuration.discussion.apiClientHeader
  }

  lazy val testPlugin = new TestPlugin(wsClient)

  "DiscussionApiPlugin getJsonOrError " should "send GU-Client headers in GET request" in {

    val responseFuture: Future[Comment] = testPlugin.commentFor(0)

    Await.ready(responseFuture, 2 seconds)

    testPlugin.headersReceived.get("GU-Client") should be(Some("nextgen-dev"))
  }
}
