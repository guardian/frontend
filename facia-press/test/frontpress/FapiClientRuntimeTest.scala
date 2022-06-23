package frontpress

import com.gu.contentapi.client.model.ItemQuery
import com.gu.contentapi.client.model.v1.ItemResponse
import com.gu.contentapi.client.{ContentApiClient => CapiContentApiClient}
import com.gu.contentatom.thrift.{Atom, AtomData, AtomDataAliases}
import com.gu.facia.api.models.Collection
import common.GuLogging
import model.pressed.EnrichedContent
import org.mockito.Mockito._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.flatspec.{AnyFlatSpec, AsyncFlatSpec}
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}
import test.{ConfiguredTestSuite, WithMaterializer, WithTestApplicationContext, WithTestContentApiClient, WithTestWsClient}

import scala.concurrent.Future

@DoNotDiscover class FapiClientRuntimeTest extends AnyFlatSpec
  with Matchers
  with ConfiguredTestSuite
  with BeforeAndAfterAll
  with WithMaterializer
  with WithTestWsClient
  with WithTestApplicationContext
  with WithTestContentApiClient
   {
  "FAPI client" should "not have NoSuchMethodError exceptions occur when using the CAPI client" in {
    com.gu.facia.api.contentapi.ContentApi.getHydrateResponse(testContentApiClient.thriftClient,
      Seq(com.gu.contentapi.client.model.SearchQuery())
    )
  }

}
