import app.FrontendComponents
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import play.api.mvc.EssentialFilter
import org.scalatestplus.mockito.MockitoSugar
import org.mockito.Mockito._
import http.GuardianAuthWithExemptions
import org.apache.pekko.stream.Materializer
import org.mockito.stubbing.Answer
import play.api.mvc.{Filter, _}

import scala.concurrent.Future

trait TestComponents {
  self: AppComponents =>

  // Don't run lifecycle components in tests
  override lazy val lifecycleComponents = List()
}

class TestAppLoader extends AppLoader {
  override def buildComponents(context: Context): FrontendComponents =
    new BuiltInComponentsFromContext(context) with AppComponents with TestComponents with MockitoSugar {
      private val mockAuth = mock[GuardianAuthWithExemptions]
      when(mockAuth.filter).thenReturn(new Filter {
        implicit val mat: Materializer = materializer
        def apply(nextFilter: RequestHeader => Future[Result])(request: RequestHeader) = nextFilter(request) // no auth
      })
      override lazy val auth = mockAuth
    }
}
