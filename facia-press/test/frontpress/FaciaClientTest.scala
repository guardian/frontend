package frontpress

import com.gu.contentapi.client.ContentApiClient
import com.gu.contentapi.client.model.{HttpResponse, SearchQuery}
import org.scalatest.flatspec._
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar

import scala.concurrent.{ExecutionContext, Future}

class FaciaClientTest extends AsyncFlatSpec with Matchers with MockitoSugar {

  "FAPI Client" should "send a CAPI client request without a runtime error like java.lang.NoSuchMethodError" in {
    // The FAPI client uses the Content API client. If this test fails with a java.lang.NoSuchMethodError, the
    // versions of FAPI client and CAPI client we are using are incompatible - the FAPI client will have been
    // compiled against a different version of the CAPI client.

    val stubContentApiClient = new ContentApiClient {
      override def apiKey: String = ""
      override def get(url: String, headers: Map[String, String])(implicit
          context: ExecutionContext,
      ): Future[HttpResponse] =
        Future.successful(HttpResponse(Array.empty, 500, ""))
    }

    // This is only exercising the code to send the request, not recieve the result, but it's enough to trigger the
    // java.lang.NoSuchMethodError seen in https://github.com/guardian/frontend/pull/25139#issuecomment-1163407402
    noException shouldBe thrownBy(
      com.gu.facia.api.contentapi.ContentApi.getHydrateResponse(
        stubContentApiClient,
        Seq(
          SearchQuery().tag("profile/roberto-tyley"),
          SearchQuery().tag("stage/comedy"),
        ),
      ),
    )
  }

}
