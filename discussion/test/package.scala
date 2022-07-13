package test

import conf.Configuration
import org.scalatest.Suites
import recorder.DefaultHttpRecorder
import play.api.libs.ws.WSClient

import java.io.File
import scala.concurrent.duration._
import discussion.api.DiscussionApiLike

import scala.concurrent.ExecutionContext

object DiscussionApiHttpRecorder extends DefaultHttpRecorder {
  override lazy val baseDir = new File(System.getProperty("user.dir"), "data/discussion")
}

class DiscussionApiStub(val wsClient: WSClient) extends DiscussionApiLike {
  protected val clientHeaderValue: String = ""

  protected val apiRoot = Configuration.discussion.apiRoot

  protected val apiTimeout = conf.Configuration.discussion.apiTimeout

  override protected def GET(url: String, headers: (String, String)*)(implicit executionContext: ExecutionContext) =
    DiscussionApiHttpRecorder
      .load(url, Map.empty)(wsClient.url(url).withRequestTimeout(2.seconds).get())(executionContext)
}

class DiscussionTestSuite
    extends Suites(
      new CommentPageControllerTest,
      new controllers.DiscussionApiPluginIntegrationTest,
      new controllers.ProfileActivityControllerTest,
      new discussion.model.CommentTest,
      new discussion.model.DiscussionKeyTest,
      new discussion.DiscussionApiTest,
      new CommentCountControllerTest,
      new ProfileTest,
    )
    with SingleServerSuite {}
