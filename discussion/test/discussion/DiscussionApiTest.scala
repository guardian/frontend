package discussion

import discussion.model.DiscussionKey
import org.scalatest.FreeSpec
import play.api.libs.ws.Response
import scala.concurrent._
import scala.concurrent.duration._
import scala.language.postfixOps

class DiscussionApiTest extends FreeSpec {


  "Should do GET request on correct URL for topComments " in {
    val expectedUrl: String = "/discussion/p/3tycg/topcomments?pageSize=10&page=1&orderBy=newest&showSwitches=true"

    val discussionApi = new DiscussionApi {
      override protected def GET(url: String, headers: (String, String)*): Future[Response] = {
        assert(expectedUrl === url)
        future {null} // Don't care what is returned for this test
      }
      protected val clientHeaderValue: String = ""
      protected val apiRoot: String = ""
    }

    Await.ready(discussionApi.topCommentsFor(DiscussionKey("p/3tycg"), "1"), 2 seconds)
  }

  "Should do GET request on correct URL for comments " in {
    val expectedUrl: String = "/discussion/p/3tycg?pageSize=10&page=1&orderBy=newest&showSwitches=true&maxResponses=3"

    val discussionApi = new DiscussionApi {
      override protected def GET(url: String, headers: (String, String)*): Future[Response] = {
        assert(expectedUrl === url)
        future {null}
      }
      protected val clientHeaderValue: String = ""
      protected val apiRoot: String = ""
    }

    Await.ready(discussionApi.commentsFor(DiscussionKey("p/3tycg"), "1"), 2 seconds)
  }


}
