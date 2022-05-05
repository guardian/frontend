package frontpress

import com.gu.contentapi.client.model.ItemQuery
import com.gu.contentapi.client.model.v1.ItemResponse
import com.gu.contentapi.client.{ContentApiClient => CapiContentApiClient}
import com.gu.contentatom.thrift.{Atom, AtomData, AtomDataAliases}
import com.gu.facia.api.models.Collection
import common.GuLogging
import model.pressed.EnrichedContent
import org.mockito.Mockito._
import org.scalatest.flatspec.AsyncFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}

import scala.concurrent.Future

class FapiFrontPressTest extends AsyncFlatSpec with Matchers with MockitoSugar with GuLogging {
  "EnrichedContent.enrichSnap" should "enrich with snap HTML" in {
    val embedUri = "http://www.example.com/snap"
    val beforeEnrichment = EnrichedContent.empty
    val collection = mock[Collection]
    val html = "<strong>Hello</strong>"
    val mockJson = Json.obj("html" -> html)
    val wsClient = mockWsResponse(embedUri, mockJson)

    val result = Enrichment.enrichSnap(Some(embedUri), beforeEnrichment, collection, wsClient)

    result map { afterEnrichment =>
      afterEnrichment.embedHtml shouldBe Some(html)
    }
  }

  "EnrichedContent.enrichSnap" should "perform no enriching when embedUri is empty" in {
    val embedUri = None
    val beforeEnrichment = EnrichedContent.empty
    val collection = mock[Collection]
    val wsClient = mock[WSClient]

    val result = Enrichment.enrichSnap(embedUri, beforeEnrichment, collection, wsClient)

    result map { afterEnrichment => afterEnrichment shouldBe beforeEnrichment }
  }

  "EnrichedContent.enrichSnap" should "perform no enriching when the response is invalid" in {
    val embedUri = "http://www.example.com/snap"
    val beforeEnrichment = EnrichedContent.empty
    val collection = mock[Collection]
    val invalidJson = Json.obj("foo" -> "bar")
    val wsClient = mockWsResponse(embedUri, invalidJson)

    val result = Enrichment.enrichSnap(Some(embedUri), beforeEnrichment, collection, wsClient)

    result map { afterEnrichment => afterEnrichment shouldBe beforeEnrichment }
  }

  "EnrichedContent.enrichInteractive" should "enrich with interactive content" in {
    val atomId = "capi-id"
    val beforeEnrichment = EnrichedContent.empty
    val collection = mock[Collection]
    val html = "<strong>Hi</strong>"
    val css = ".myClass {}"
    val js = "console.log('hi')"
    val mockAtom = mockInteractiveAtom(html, css, js)
    val capiClient = mockCapiResponse(atomId, Some(mockAtom))

    val result = Enrichment.enrichInteractive(Some(atomId), beforeEnrichment, collection, capiClient)

    result map { afterEnrichment =>
      afterEnrichment.embedHtml shouldBe Some(html)
      afterEnrichment.embedCss shouldBe Some(css)
      afterEnrichment.embedJs shouldBe Some(js)
    }
  }

  "EnrichedContent.enrichInteractive" should "throw an exception when no interactive data" in {
    val atomId = "capi-id"
    val beforeEnrichment = EnrichedContent.empty
    val collection = mock[Collection]
    when(collection.id).thenReturn("fake-collection-id")
    val badMockAtom = None
    val capiClient = mockCapiResponse(atomId, badMockAtom)

    val futureException = recoverToExceptionIf[Throwable] {
      Enrichment.enrichInteractive(Some(atomId), beforeEnrichment, collection, capiClient)
    }

    futureException.map { caught =>
      caught.getMessage should include(s"failed to enrich atom $atomId")
    }
  }

  "EnrichedContent.enrichInteractive" should "throw an exception when the atom id is empty" in {
    val atomId = None
    val beforeEnrichment = EnrichedContent.empty
    val collection = mock[Collection]
    val capiClient = mock[CapiContentApiClient]

    val futureException = recoverToExceptionIf[Throwable] {
      Enrichment.enrichInteractive(atomId, beforeEnrichment, collection, capiClient)
    }

    futureException.map { caught =>
      caught.getMessage should include("atomId was undefined")
    }
  }

  "EnrichedContent.enrichInteractive" should "throw an exception when the call to CAPI fails" in {
    val atomId = "fake-capi-id"
    val beforeEnrichment = EnrichedContent.empty
    val collection = mock[Collection]
    val capiClient = mockCapiFailure(atomId)

    val futureException = recoverToExceptionIf[Throwable] {
      Enrichment.enrichInteractive(Some(atomId), beforeEnrichment, collection, capiClient)
    }

    futureException.map { caught =>
      caught.getMessage should include("Error message from CAPI")
    }
  }

  def mockWsResponse(embedUri: String, json: JsValue): WSClient = {
    val wsClient = mock[WSClient]
    val mockResponse = mock[WSResponse]
    val mockRequest = mock[WSRequest]

    when(mockResponse.json).thenReturn(json)
    when(mockRequest.get()).thenReturn(Future.successful(mockResponse))
    when(wsClient.url(embedUri)).thenReturn(mockRequest)

    wsClient
  }

  def mockInteractiveAtom(html: String, css: String, js: String): Atom = {
    val mockAtom = mock[Atom]
    val mockAtomData = mock[AtomData.Interactive]
    val mockInteractive = mock[AtomDataAliases.InteractiveAlias]

    when(mockInteractive.html).thenReturn(html)
    when(mockInteractive.css).thenReturn(css)
    when(mockInteractive.mainJS).thenReturn(Some(js))
    when(mockAtomData.interactive).thenReturn(mockInteractive)
    when(mockAtom.data).thenReturn(mockAtomData)

    mockAtom
  }

  def mockCapiResponse(id: String, interactive: Option[Atom]): CapiContentApiClient = {
    val capiClient = mock[CapiContentApiClient]
    val mockResponse = mock[ItemResponse]
    when(mockResponse.interactive).thenReturn(interactive)
    when(capiClient.getResponse(ItemQuery(id))).thenReturn(Future.successful(mockResponse))

    capiClient
  }

  def mockCapiFailure(id: String): CapiContentApiClient = {
    val capiClient = mock[CapiContentApiClient]
    when(capiClient.getResponse(ItemQuery(id))).thenReturn(Future.failed(new Exception("Error message from CAPI")))

    capiClient
  }
}
