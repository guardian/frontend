package test

import scala.concurrent.{ExecutionContext, Future}

import org.mockito.Mockito.when
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.Json
import play.api.libs.ws.WSResponse
import play.api.test.Helpers._
import controllers.CommentsController
import discussion.model.DiscussionKey
import org.scalatest.flatspec.AnyFlatSpec

@DoNotDiscover class CommentPageControllerTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestApplicationContext
    with WithTestCSRF
    with WithTestWsClient
    with MockitoSugar {

  private def mockBadRequest(errorBody: String): WSResponse = {
    val errorResponse = mock[WSResponse]
    when(errorResponse.status).thenReturn(BAD_REQUEST)
    when(errorResponse.statusText).thenReturn("Bad Request")
    when(errorResponse.body).thenReturn(errorBody)
    when(errorResponse.json).thenReturn(Json.parse(errorBody))
    errorResponse
  }

  private def discussionApiWithResponse(response: WSResponse): DiscussionApiStub =
    new DiscussionApiStub(wsClient) {
      override protected def GET(url: String, headers: (String, String)*)(implicit
          executionContext: ExecutionContext,
      ): Future[WSResponse] = Future.successful(response)
    }

  "Discussion" should "return 200" in {
    val commentsController = new CommentsController(
      new DiscussionApiStub(wsClient),
      csrfCheck,
      csrfAddToken,
      play.api.test.Helpers.stubControllerComponents(),
    )
    val result = commentsController.comments(DiscussionKey("p/37v3a"))(TestRequest())
    status(result) should be(200)
  }

  it should "return 404 when the requested page is beyond the available pages" in {
    val errorBody =
      """
        |{
        |  "status": "error",
        |  "statusCode": 400,
        |  "message": "Requested page is beyond the number of available pages",
        |  "errorCode": "INVALID_PAGE_NUMBER"
        |}
        |""".stripMargin
    val errorResponse = mockBadRequest(errorBody)
    val discussionApi = discussionApiWithResponse(errorResponse)
    val commentsController = new CommentsController(
      discussionApi,
      csrfCheck,
      csrfAddToken,
      play.api.test.Helpers.stubControllerComponents(),
    )

    val result = commentsController.comments(DiscussionKey("p/37v3a"))(TestRequest())

    status(result) should be(NOT_FOUND)
  }

  it should "return 500 for an unrecognised 400 error body" in {
    val errorBody = """{"error": "error happened"}"""
    val errorResponse = mockBadRequest(errorBody)
    val discussionApi = discussionApiWithResponse(errorResponse)
    val commentsController = new CommentsController(
      discussionApi,
      csrfCheck,
      csrfAddToken,
      play.api.test.Helpers.stubControllerComponents(),
    )

    val result = commentsController.comments(DiscussionKey("p/37v3a"))(TestRequest())

    status(result) should be(INTERNAL_SERVER_ERROR)
  }
}
