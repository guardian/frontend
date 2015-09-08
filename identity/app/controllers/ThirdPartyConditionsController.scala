package controllers

import actions.AuthenticatedActions
import client.Error
import com.google.inject.{Inject, Singleton}
import common.ExecutionContexts
import conf.IdentityConfiguration
import utils.{ThirdPartyConditions, SafeLogging}
import ThirdPartyConditions._
import form.Mappings
import idapiclient.IdApiClient
import model.{IdentityPage, NoCache}
import play.api.i18n.MessagesApi
import play.api.mvc._
import play.filters.csrf.CSRFAddToken
import services._
import utils.SafeLogging

import scala.concurrent.Future

@Singleton
class ThirdPartyConditionsController @Inject()(returnUrlVerifier: ReturnUrlVerifier,
                                               idRequestParser: IdRequestParser,
                                               conf: IdentityConfiguration,
                                               api: IdApiClient,
                                               idUrlBuilder: IdentityUrlBuilder,
                                               authenticatedActions: AuthenticatedActions,
                                               val messagesApi: MessagesApi)
  extends Controller with ExecutionContexts with SafeLogging with Mappings {

  import authenticatedActions.{agreeAction, authAction}

  val page = IdentityPage("/agree", "Terms and Conditions", "agree")

  def renderAgree(groupCode: String) = CSRFAddToken {
    agreeAction(redirectToSignInWithThirdPartyConditions).async { implicit request =>
      val userId = request.user.getId()
      val idRequest = idRequestParser(request)

      validGroupCode(thirdPartyConditions, Some(groupCode)) match {
        case Some(validGroupCode) => {
          api.user(userId, request.user.auth).map {
            case Right(user) => {
              val userIsInGroup = UserGroupService.isUserInGroup(user, validGroupCode)
              val skipThirdPartyLandingPage = idRequest.skipThirdPartyLandingPage
              val finalReturnUrl = idRequest.returnUrl.getOrElse(returnUrlVerifier.defaultReturnUrl)

              (userIsInGroup, skipThirdPartyLandingPage) match {
                case (true, _) => SeeOther(finalReturnUrl)
                case (false, false) => NoCache(Ok(views.html.agree(page, idRequest, idUrlBuilder, validGroupCode)))
                case (false, true) => {
                  api.addUserToGroup(validGroupCode, request.user.auth)
                  SeeOther(finalReturnUrl)
                }
              }
            }
            case _ => NotFound
          }
        }
        case _ => Future(BadRequest)
      }
    }
  }

  def agree(groupCode: String, returnUrl: Option[String]) = CSRFAddToken {
    authAction.async { implicit request =>
      api.addUserToGroup(groupCode, request.user.auth).map(_ =>
        SeeOther(returnUrlVerifier.getVerifiedReturnUrl(returnUrl).getOrElse(returnUrlVerifier.defaultReturnUrl))
      )
    }
  }

  def redirectToSignInWithThirdPartyConditions(requestHeader: RequestHeader) = {
    val idRequest = idRequestParser(requestHeader)
    val signInPath: String= extractGroupCode(requestHeader.uri) match {
      case Some(groupCode) => s"/signin?group=${groupCode}"
      case _ => "/signin"
    }
    val signInUrl = idUrlBuilder.buildUrl(signInPath, idRequest)
    SeeOther(signInUrl)
  }

}
