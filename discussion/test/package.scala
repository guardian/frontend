package test

import conf.Configuration
import controllers.HealthCheck
import org.scalatest.{BeforeAndAfterAll, Suites}
import recorder.DefaultHttpRecorder
import play.api.libs.ws.WSClient
import java.io.File

import discussion.DiscussionApiLike


object DiscussionApiHttpRecorder extends DefaultHttpRecorder {
  override lazy val baseDir = new File(System.getProperty("user.dir"), "data/discussion")
}

class DiscussionApiStub(val wsClient: WSClient) extends DiscussionApiLike {
  protected val clientHeaderValue: String =""

  protected val apiRoot =
    if (Configuration.environment.isProd)
      Configuration.discussion.apiRoot
    else
      Configuration.discussion.apiRoot.replaceFirst("https://", "http://") // CODE SSL cert is defective and expensive to fix

  protected val apiTimeout = conf.Configuration.discussion.apiTimeout

  override protected def GET(url: String, headers: (String, String)*) = DiscussionApiHttpRecorder.load(url, Map.empty){
    wsClient.url(url).withRequestTimeout(2000).get()
  }
}

class DiscussionTestSuite extends Suites (
  new CommentPageControllerTest,
  new controllers.DiscussionApiPluginIntegrationTest,
  new controllers.ProfileActivityControllerTest,
  new discussion.model.CommentTest,
  new discussion.model.DiscussionKeyTest,
  new discussion.DiscussionApiTest,
  new CommentCountControllerTest,
  new ProfileTest
) with SingleServerSuite
  with BeforeAndAfterAll
  with WithTestWsClient {
  override lazy val port: Int = new HealthCheck(wsClient).testPort
}
