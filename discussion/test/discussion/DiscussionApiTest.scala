package discussion

import discussion.model.DiscussionKey
import org.scalatest.{DoNotDiscover, FreeSpec}
import play.api.libs.ws.WSResponse
import play.api.mvc.Headers
import test.ConfiguredTestSuite
import views.support.URLEncode
import scala.concurrent._
import scala.concurrent.duration._
import scala.language.postfixOps

@DoNotDiscover class DiscussionApiTest extends FreeSpec with ConfiguredTestSuite {

  def urlValidator(expectedUrl: String) : DiscussionApi = {
    new DiscussionApi {
      override protected def GET(url: String, headers: (String, String)*): Future[WSResponse] = {
        assert(expectedUrl === url)
        Future {null} // Don't care what is returned for this test
      }
      protected val clientHeaderValue: String = ""
      protected val apiRoot: String = ""
    }
  }

  def waitFor(f: Future[_], timeout: Duration = 2 seconds) = Await.ready(f, timeout)

  "Should do get request on correct URL for comments count" in {
    val shortUrlIds = "p/3tycg"
    waitFor(urlValidator(s"/getCommentCounts?short-urls=$shortUrlIds&api-key=dotcom").commentCounts(shortUrlIds))
  }
  "Should do get request on correct URL for comment" in {
    val id = 15724322
    val displayThreaded = "true"
    waitFor(urlValidator(s"/comment/$id?displayResponses=true&displayThreaded=$displayThreaded&api-key=dotcom").commentFor(id, Some(displayThreaded)))
  }

  "Should do GET request on correct URL for topComments " in {
    val expectedUrl: String = "/discussion/p/3tycg/topcomments?pageSize=50&page=1&orderBy=newest&showSwitches=true&maxResponses=5&api-key=dotcom"

    waitFor(urlValidator(expectedUrl).commentsFor(DiscussionKey("p/3tycg"), DiscussionParams(
      orderBy = "newest",
      page = "1",
      pageSize = "50",
      topComments = true,
      maxResponses = Some("5"),
      displayThreaded = true
    )))
  }

  "Should do GET request on correct URL for comments " in {
    val expectedUrl: String = "/discussion/p/3tycg?pageSize=50&page=1&orderBy=newest&displayThreaded=false&showSwitches=true&api-key=dotcom"

    waitFor(urlValidator(expectedUrl).commentsFor(DiscussionKey("p/3tycg"), DiscussionParams(
      orderBy = "newest",
      page = "1",
      pageSize = "50",
      maxResponses = None,
      displayThreaded = false
    )))
  }

  "Should do GET request on correct URL for comment context" in {

    val id = 15724322
    val params = DiscussionParams(
      orderBy = "newest",
      page = "1",
      pageSize = "50",
      displayThreaded = false
    )
    val expectedUrl = s"/comment/$id/context?pageSize=${params.pageSize}&orderBy=${params.orderBy}&displayThreaded=${params.displayThreaded}&api-key=dotcom"
    waitFor(urlValidator(expectedUrl).commentContext(id, params))

  }

  "Should do GET request on correct URL for my profile" in {
    waitFor(urlValidator("/profile/me?api-key=dotcom").myProfile(Headers()))
  }

  "Should do GET request on correct URL for profile comments" in {
    val userId = "10000001"
    val orderBy = "newest"
    val page = "1"
    val expectedUrl = s"/profile/$userId/comments?pageSize=10&page=$page&orderBy=$orderBy&showSwitches=true&displayHighlighted=true&api-key=dotcom"
    waitFor(urlValidator(expectedUrl).profileComments(userId = userId, page = page, orderBy = orderBy, picks = true))
  }

  "Should do GET request on correct URL for profile replies" in {
    val userId = "10000001"
    val page = "1"
    val expectedUrl = s"/profile/$userId/replies?pageSize=10&page=$page&orderBy=newest&showSwitches=true&api-key=dotcom"
    waitFor(urlValidator(expectedUrl).profileReplies(userId = userId, page = page))
  }

  "Should do GET request on correct URL for profile search" in {
    val userId = "10000001"
    val page = "1"
    val query = "fakeQuery"
    val expectedUrl = s"/search/profile/$userId?q=$query&page=$page&api-key=dotcom"
    waitFor(urlValidator(expectedUrl).profileSearch(userId = userId, q = query, page = page))
  }

  "Should do GET request on correct URL for profile discussions" in {
    val userId = "10000001"
    val page = "1"
    val expectedUrl = s"/profile/$userId/discussions?pageSize=10&page=$page&orderBy=newest&showSwitches=true&api-key=dotcom"
    waitFor(urlValidator(expectedUrl).profileDiscussions(userId = userId, page = page))
  }

}
