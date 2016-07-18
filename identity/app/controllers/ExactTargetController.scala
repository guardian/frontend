package controllers

import actions.AuthenticatedActions
import play.api.mvc._
import common.ExecutionContexts
import services.{IdRequestParser, ReturnUrlVerifier}
import utils.SafeLogging
import scala.collection.convert.wrapAsJava._
import conf.IdentityConfiguration
import play.api.libs.ws._
import exacttarget.SubscriptionDef

class ExactTargetController(
                           conf: IdentityConfiguration,
                           returnUrlVerifier: ReturnUrlVerifier,
                           idRequestParser: IdRequestParser,
                           authenticatedActions: AuthenticatedActions)
  extends Controller with ExecutionContexts with SafeLogging {

  import play.api.Play.current
  import authenticatedActions.authAction

  def subscribe(subscriptionDefId: String, returnUrl: String) = authAction.apply {
    implicit request =>

      idRequestParser(request).returnUrl match {
        case Some(verifiedReturnUrl) =>
          val user = request.user
          for {
            exactTargetFactory <- conf.exacttarget.factory
            emailAddress: String <- Option(user.getPrimaryEmailAddress) if !emailAddress.isEmpty
            subscriptionDef <- SubscriptionDef.All.get(subscriptionDefId)
          } {
            val automaticParameters = Map("EmailAddress" -> emailAddress, "Field_A" -> user.getId)

            val dataExtId = subscriptionDef.dataExtension
            val parameters = subscriptionDef.parameters ++ automaticParameters

            val triggeredEmailRequest =
              exactTargetFactory.createRequest(emailAddress, parameters, "Create", dataExtId.businessUnitId, dataExtId.customerKey)

            WS.url(exactTargetFactory.endPoint.toString).withHeaders(
              "Content-Type" -> "text/xml; charset=utf-8",
              "SOAPAction" -> triggeredEmailRequest.getSoapAction
            ).post(triggeredEmailRequest.getSoapEnvelopeString).onSuccess {
              case resp =>
                (resp.xml \\ "CreateResponse" \ "Results") map {
                  subscriberNode =>
                    val statusCode = (subscriberNode \ "StatusCode").text.trim
                    val statusMessage = (subscriberNode \ "StatusMessage").text.trim
                    logger.info(s"CreateResponse - $statusCode : $statusMessage")
                }
            }
          }

          SeeOther(verifiedReturnUrl)
        case None =>
          SeeOther(returnUrlVerifier.defaultReturnUrl)
      }
  }
}
