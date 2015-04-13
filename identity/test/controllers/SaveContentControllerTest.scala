package controllers

import actions.AuthenticatedActions
import actions.AuthenticatedActions.AuthRequest
import client.Auth
import com.gu.identity.cookie.GuUCookieData
import com.gu.identity.model.{SyncedPrefs, User, SavedArticles}
import idapiclient.{IdApiClient, ScGuU, TrackingData}
import model.FrontendSyncedPrefs
import org.mockito.{Matchers, ArgumentMatcher}
import org.scalatest.{ShouldMatchers, path}
import org.scalatest.mock.MockitoSugar
import play.api.mvc.RequestHeader
import services._
import org.mockito.Matchers._
import test.{TestRequest, Fake}
import org.mockito.Mockito._

import scala.concurrent.Future

class SaveContentControllerTest extends path.FreeSpec with ShouldMatchers with MockitoSugar {

   val returnUrlVerifier = mock[ReturnUrlVerifier]
   val ipRequestParser = mock[IdRequestParser]
   val authService = mock[AuthenticationService]
   val syncedPrefs = mock[FrontendSyncedPrefs]
   val savedArticles = mock[SavedArticles]

   val shortUrl = "aShortUrl"
   val trackingData = mock[TrackingData]
   val returnUrl = "http://www.theguardian.com/clarkson-is-a-twat-vote-labour"
   val identityRequest = IdentityRequest(trackingData, Some(returnUrl), None, Some(false), Some(shortUrl))
   val userId = "1234"
   val user = User("test@example.com", userId)
   val testAuth = ScGuU("abcd", GuUCookieData(user, 0, None))
   val authenticatedUser = AuthenticatedUser(user, testAuth)


   val api = mock[IdApiClient]
   val authenticatedActions = new AuthenticatedActions(authService, api, mock[IdentityUrlBuilder])
   when(api.syncedPrefs(anyString(), any[Auth])) thenReturn Future.successful(Right(syncedPrefs))

   when(syncedPrefs.addArticle(anyString(), anyString())) thenReturn savedArticles

   val controller = new SaveContentController(api, ipRequestParser, authenticatedActions, returnUrlVerifier)


   "the save content method" - Fake {

     val testRequest = TestRequest()
     val authRequest = new AuthRequest(authenticatedUser, testRequest)

     "when the returnUrl, userId and shortUrl params are present" - {
       when(ipRequestParser.apply(any[RequestHeader])) thenReturn identityRequest
       when(authService.authenticatedUserFor(any[RequestHeader])) thenReturn Some(AuthenticatedUser(user, testAuth))
       when(syncedPrefs.contains(anyString())) thenReturn false

       "Should look up the users saved article list in their saved preferences" in {

         controller.saveContentItem()(testRequest)
         verify(api).syncedPrefs(Matchers.eq(userId), Matchers.eq(testAuth))
       }

       "should add the add the article to the saved list if not present" in {
         controller.saveContentItem()(testRequest)
         verify(api).syncedPrefs(Matchers.eq(userId), Matchers.eq(testAuth))
         verify(syncedPrefs).addArticle(Matchers.eq(returnUrl), Matchers.eq(shortUrl))
      }

      "should save the altered list of articles to the api" in {
          controller.saveContentItem()(testRequest)
          verify(api).syncedPrefs(Matchers.eq(userId), Matchers.eq(testAuth))
          verify(syncedPrefs).contains(Matchers.eq(shortUrl))
          verify(syncedPrefs).addArticle(Matchers.eq(returnUrl), Matchers.eq(shortUrl))
          verify(api).saveArticle(Matchers.eq(userId), Matchers.eq(testAuth), Matchers.eq(savedArticles))
      }
   }
}
