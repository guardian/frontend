package test

import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._
import controllers.CommentsController
import discussion.model.DiscussionKey
import play.api.libs.crypto.CSRFTokenSigner
import play.filters.csrf.{CSRFAddToken, CSRFCheck, CSRFConfig}

@DoNotDiscover class CommentPageControllerTest extends FlatSpec
  with Matchers
  with ConfiguredTestSuite
  with BeforeAndAfterAll
  with WithMaterializer
  with WithTestEnvironment
  with WithTestWsClient {

  lazy val csrfConfig: CSRFConfig = CSRFConfig.fromConfiguration(app.configuration)
  lazy val csrfCheck = new CSRFCheck(csrfConfig, app.injector.instanceOf[CSRFTokenSigner])
  lazy val csrfAddToken = new CSRFAddToken(csrfConfig, app.injector.instanceOf[CSRFTokenSigner])

  "Discussion" should "return 200" in {
    val commentsController = new CommentsController(new DiscussionApiStub(wsClient), csrfCheck, csrfAddToken)
    val result = commentsController.comments(DiscussionKey("p/37v3a"))(TestRequest())
    status(result) should be(200)
  }
}
