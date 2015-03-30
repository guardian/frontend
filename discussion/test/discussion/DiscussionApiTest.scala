package discussion

import discussion.model.DiscussionKey
import org.scalatest.{DoNotDiscover, FreeSpec}
import play.api.libs.ws.WSResponse
import test.ConfiguredTestSuite
import scala.concurrent._
import scala.concurrent.duration._
import scala.language.postfixOps

@DoNotDiscover class DiscussionApiTest extends FreeSpec with ConfiguredTestSuite {

  "Should do GET request on correct URL for topComments " in {
    val expectedUrl: String = "/discussion/p/3tycg/topcomments?pageSize=50&page=1&orderBy=newest&showSwitches=true"

    val discussionApi = new DiscussionApi {
      override protected def GET(url: String, headers: (String, String)*): Future[WSResponse] = {
        assert(expectedUrl === url)
        Future {null} // Don't care what is returned for this test
      }
      protected val clientHeaderValue: String = ""
      protected val apiRoot: String = ""
    }

    Await.ready(discussionApi.commentsFor(DiscussionKey("p/3tycg"), DiscussionParams(
      orderBy = "newest",
      page = "1",
      pageSize = "50",
      maxResponses = None,
      topComments = true,
      displayThreaded = true
    )), 2 seconds)
  }

  "Should do GET request on correct URL for comments " in {
    val expectedUrl: String = "/discussion/p/3tycg?pageSize=50&page=1&orderBy=newest&showSwitches=true"


    val discussionApi = new DiscussionApi {
      override protected def GET(url: String, headers: (String, String)*): Future[WSResponse] = {
        assert(expectedUrl === url)
        Future {null}
      }
      protected val clientHeaderValue: String = ""
      protected val apiRoot: String = ""
    }

    Await.ready(discussionApi.commentsFor(DiscussionKey("p/3tycg"), DiscussionParams(
      orderBy = "newest",
      page = "1",
      pageSize = "50",
      maxResponses = None,
      topComments = false,
      displayThreaded = true
    )), 2 seconds)
  }


}
