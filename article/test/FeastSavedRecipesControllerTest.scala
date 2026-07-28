package test

import controllers.FeastSavedRecipesController
import org.mockito.ArgumentMatchers._
import org.mockito.Mockito._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.http.HeaderNames.AUTHORIZATION
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}
import play.api.test.FakeRequest
import play.api.test.Helpers._

import scala.concurrent.Future

@DoNotDiscover class FeastSavedRecipesControllerTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with MockitoSugar
    with BeforeAndAfterAll
    with WithMaterializer {

  trait Fixture {
    val wsClient: WSClient = mock[WSClient]
    val wsRequest: WSRequest = mock[WSRequest]
    val wsResponse: WSResponse = mock[WSResponse]

    when(wsClient.url(any[String])).thenReturn(wsRequest)
    when(wsRequest.withHttpHeaders(any[(String, String)])).thenReturn(wsRequest)
    when(wsRequest.withQueryStringParameters(any[(String, String)])).thenReturn(wsRequest)
    when(wsRequest.withBody(any[String])(any())).thenReturn(wsRequest)
    when(wsRequest.withMethod(any[String])).thenReturn(wsRequest)

    val controller = new FeastSavedRecipesController(stubControllerComponents(), wsClient)
  }

  "getSavedRecipes" should "return 400 when the ids query parameter is missing" in new Fixture {
    val result = controller.getSavedRecipes(None)(FakeRequest("GET", "/api/feast-saved-recipes"))
    status(result) shouldBe BAD_REQUEST
    verifyNoInteractions(wsClient)
  }

  it should "return 400 when the ids query parameter is empty" in new Fixture {
    val result = controller.getSavedRecipes(Some(""))(FakeRequest("GET", "/api/feast-saved-recipes?ids="))
    status(result) shouldBe BAD_REQUEST
    verifyNoInteractions(wsClient)
  }

  it should "return 400 when more than 5 ids are supplied" in new Fixture {
    val request = FakeRequest("GET", "/api/feast-saved-recipes?ids=a,b,c,d,e,f")
      .withHeaders(AUTHORIZATION -> "Bearer a-token")
    val result = controller.getSavedRecipes(Some("a,b,c,d,e,f"))(request)
    status(result) shouldBe BAD_REQUEST
    verifyNoInteractions(wsClient)
  }

  it should "return 401 when there is no Authorization header" in new Fixture {
    val result = controller.getSavedRecipes(Some("a,b,c"))(FakeRequest("GET", "/api/feast-saved-recipes?ids=a,b,c"))
    status(result) shouldBe UNAUTHORIZED
    verifyNoInteractions(wsClient)
  }

  it should "proxy the request to the Feast API, forwarding the Authorization header, and pass through the response" in new Fixture {
    val upstreamJson = """[{"recipeId":"a","lastModified":"2024-01-01T00:00:00Z"}]"""
    when(wsResponse.status).thenReturn(200)
    when(wsResponse.body).thenReturn(upstreamJson)
    when(wsRequest.get()).thenReturn(Future.successful(wsResponse))

    val request = FakeRequest("GET", "/api/feast-saved-recipes?ids=a,b,c")
      .withHeaders(AUTHORIZATION -> "Bearer a-token")
    val result = controller.getSavedRecipes(Some("a,b,c"))(request)

    status(result) shouldBe OK
    contentAsString(result) shouldBe upstreamJson
    verify(wsRequest).withHttpHeaders(AUTHORIZATION -> "Bearer a-token")
    verify(wsRequest).withQueryStringParameters("ids" -> "a,b,c")
  }

  it should "return 502 when the request to the Feast API fails" in new Fixture {
    when(wsRequest.get()).thenReturn(Future.failed(new RuntimeException("boom")))

    val request = FakeRequest("GET", "/api/feast-saved-recipes?ids=a,b,c")
      .withHeaders(AUTHORIZATION -> "Bearer a-token")
    val result = controller.getSavedRecipes(Some("a,b,c"))(request)

    status(result) shouldBe BAD_GATEWAY
  }

  "saveRecipe" should "return 401 when there is no Authorization header" in new Fixture {
    val result = controller.saveRecipe("some-recipe-id")(FakeRequest("PUT", "/api/feast-saved-recipes/some-recipe-id"))
    status(result) shouldBe UNAUTHORIZED
    verifyNoInteractions(wsClient)
  }

  it should "proxy a PUT to the Feast API and return 204 when the upstream returns No Content" in new Fixture {
    when(wsResponse.status).thenReturn(204)
    when(wsRequest.execute()).thenReturn(Future.successful(wsResponse))

    val request = FakeRequest("PUT", "/api/feast-saved-recipes/some-recipe-id")
      .withHeaders(AUTHORIZATION -> "Bearer a-token")
    val result = controller.saveRecipe("some-recipe-id")(request)

    status(result) shouldBe NO_CONTENT
    verify(wsClient).url("https://recipes.code.dev-guardianapis.com/v2/saved-from-web/some-recipe-id")
    verify(wsRequest).withHttpHeaders(AUTHORIZATION -> "Bearer a-token")
    verify(wsRequest).withMethod("PUT")
  }

  it should "pass through the upstream status and body when the upstream does not return No Content" in new Fixture {
    when(wsResponse.status).thenReturn(200)
    when(wsResponse.body).thenReturn("""{"recipeId":"some-recipe-id","lastModified":"2024-01-01T00:00:00Z"}""")
    when(wsRequest.execute()).thenReturn(Future.successful(wsResponse))

    val request = FakeRequest("PUT", "/api/feast-saved-recipes/some-recipe-id")
      .withHeaders(AUTHORIZATION -> "Bearer a-token")
    val result = controller.saveRecipe("some-recipe-id")(request)

    status(result) shouldBe OK
    contentAsString(result) shouldBe """{"recipeId":"some-recipe-id","lastModified":"2024-01-01T00:00:00Z"}"""
  }

  it should "return 502 when the request to the Feast API fails" in new Fixture {
    when(wsRequest.execute()).thenReturn(Future.failed(new RuntimeException("boom")))

    val request = FakeRequest("PUT", "/api/feast-saved-recipes/some-recipe-id")
      .withHeaders(AUTHORIZATION -> "Bearer a-token")
    val result = controller.saveRecipe("some-recipe-id")(request)

    status(result) shouldBe BAD_GATEWAY
  }
}
