package controllers.cache

import java.net.URI

import cache.SurrogateKey
import com.gu.googleauth.UserIdentity
import common.{ExecutionContexts, Logging}
import controllers.AuthLogging
import controllers.admin.AuthActions
import model.NoCache
import play.api.mvc.Security.AuthenticatedRequest
import play.api.mvc.{AnyContent, Controller}
import purge.CdnPurge

import scala.concurrent.Future.successful

object PageDecacheController extends Controller with Logging with AuthLogging with ExecutionContexts {

  def renderPageDecacheForm() = AuthActions.AuthActionTest { request =>
    NoCache(Ok(views.html.cache.pageDecacheForm()))
  }

  def decache() = AuthActions.AuthActionTest.async { request =>
    getSubmittedUrl(request).map(new URI(_)).map{ urlToDecache =>

      CdnPurge.hard(SurrogateKey(urlToDecache.getPath))
      successful(NoCache(Ok(views.html.cache.pageDecacheForm())))
    }.getOrElse(successful(BadRequest("No image submitted")))

  }

  private def getSubmittedUrl(request: AuthenticatedRequest[AnyContent, UserIdentity]): Option[String] = request
    .body.asFormUrlEncoded
    .getOrElse(Map.empty)
    .get("url")
    .flatMap(_.headOption)
    .map(_.trim)

}
