package controllers

import actions.AuthenticatedActions
import play.api.mvc._
import common.ImplicitControllerExecutionContext
import services.{IdRequestParser, ReturnUrlVerifier}
import utils.SafeLogging
import scala.collection.JavaConverters._
import conf.IdentityConfiguration
import play.api.libs.ws.WSClient
import exacttarget.SubscriptionDef

class ExactTargetController(
  conf: IdentityConfiguration,
  returnUrlVerifier: ReturnUrlVerifier,
  idRequestParser: IdRequestParser,
  authenticatedActions: AuthenticatedActions,
  wsClient: WSClient,
  val controllerComponents: ControllerComponents
) extends BaseController with ImplicitControllerExecutionContext with SafeLogging {

  import authenticatedActions.fullAuthAction

  def subscribe(subscriptionDefId: String, returnUrl: String): Action[AnyContent] = fullAuthAction.apply {
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
              exactTargetFactory.createRequest(emailAddress, parameters.asJava, "Create", dataExtId.businessUnitId, dataExtId.customerKey)

            wsClient
              .url(exactTargetFactory.endPoint.toString)
              .withHttpHeaders(
                "Content-Type" -> "text/xml; charset=utf-8",
                "SOAPAction" -> triggeredEmailRequest.getSoapAction
              )
              .post(triggeredEmailRequest.getSoapEnvelopeString).foreach { resp =>
                (resp.xml \\ "CreateResponse" \ "Results") foreach {
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
