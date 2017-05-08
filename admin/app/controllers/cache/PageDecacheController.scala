package controllers.cache

import java.net.{URI, URL}

import cache.SurrogateKey
import com.gu.googleauth.UserIdentity
import common.{ExecutionContexts, Logging}
import controllers.admin.AuthActions
import model.{ApplicationContext, NoCache}
import play.api.libs.ws.WSClient
import play.api.mvc.Security.AuthenticatedRequest
import play.api.mvc._
import purge.CdnPurge
import tools.LoadBalancer
import scala.concurrent.duration._
import scala.concurrent.Future
import scala.concurrent.Future.successful

case class PrePurgeTestResult(url: String, passed: Boolean)

class PageDecacheController(wsClient: WSClient)(implicit context: ApplicationContext) extends Controller with Logging with ExecutionContexts {

  val authActions = new AuthActions(wsClient)

  def renderPageDecache(url: Option[String] = None): Action[AnyContent] = Action.async { implicit request =>
    url match {
      case Some(s) => renderPrePurgeTestResult(s)
      case None => Future(NoCache(Ok(views.html.cache.pageDecache())))
    }
  }

  private def renderPrePurgeTestResult(purgeUrl: String)(implicit request: Request[AnyContent]) = {
    getRouterUrl(purgeUrl).map { routerUrl =>
      wsClient.url(routerUrl)
        .withRequestTimeout(2.second)
        .withVirtualHost("www.theguardian.com")
        .withFollowRedirects(true)
        .get()
        .map { response =>
          PrePurgeTestResult(purgeUrl, response.status >= 200 && response.status < 300)
        }.recoverWith {
          case _: Throwable => successful(PrePurgeTestResult(purgeUrl, passed = false))
        }.map { result =>
          NoCache(Ok(views.html.cache.pageDecache(Some(result))))
        }
    }.getOrElse(successful(InternalServerError("Couldn't get router URL - please go back and try again")))
  }

  def decache(): Action[AnyContent] = authActions.AuthActionTest.async { implicit request =>
    getSubmittedUrl(request).map(new URI(_)).map{ urlToDecache =>

      new CdnPurge(wsClient)
        .soft(SurrogateKey(urlToDecache.getPath))
        .map { purgeSent =>
          val message = if(purgeSent) "Purge request successfully sent" else "Purge request was not successful, please report this issue"
          NoCache(Ok(views.html.cache.pageDecache(None, message)))
        }
    }.getOrElse(successful(BadRequest("No page submitted")))
  }

  private def getRouterUrl(url: String): Option[String] =
    LoadBalancer("frontend-router")
      .flatMap(_.url)
      .map { router =>
        val path = new URL(url).getPath
        s"http://$router$path"
      }

  private def getSubmittedUrl(request: AuthenticatedRequest[AnyContent, UserIdentity]): Option[String] =
    request
      .body.asFormUrlEncoded
      .getOrElse(Map.empty)
      .get("url")
      .flatMap(_.headOption)
      .map(_.trim)

}
