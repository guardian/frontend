package controllers

import conf.Configuration
import discussion.DiscussionApi
import discussion.model.Comment
import org.scalatest._
import test.ConfiguredTestSuite
import scala.concurrent.{Future, Await}
import scala.language.postfixOps
import scala.concurrent.duration._
import play.api.libs.ws.WS

@DoNotDiscover class DiscussionApiPluginIntegrationTest extends FlatSpecLike with Matchers with BeforeAndAfterAll with ConfiguredTestSuite {

  object TestPlugin extends DiscussionApi {

    override def GET(url: String, headers: (String, String)*) = {
      headersReceived = Map(headers:_*)
      WS.url(testUrl).withRequestTimeout(1).get()
    }

    var headersReceived: Map[String,String] = Map.empty
    val testUrl = "http://test-url"

    override protected val apiRoot = Configuration.discussion.apiRoot
    override protected val clientHeaderValue: String = Configuration.discussion.apiClientHeader
  }

  "DiscussionApiPlugin getJsonOrError " should "send GU-Client headers in GET request" in {

    val responseFuture: Future[Comment] = TestPlugin.comment(0)

    Await.ready(responseFuture, 2 seconds)

    TestPlugin.headersReceived.get("GU-Client") should be (Some("nextgen-dev"))
  }
}
