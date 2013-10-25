package controllers

import com.google.inject.{Inject, Singleton}
import services.{IdentityUrlBuilder, IdRequestParser, ReturnUrlVerifier}
import conf.IdentityConfiguration
import idapiclient.IdApiClient
import common.ExecutionContexts
import utils.SafeLogging
import play.api.mvc._
import scala.concurrent.Future
import model.IdentityPage
import play.api.data._


@Singleton
class EmailController @Inject()(returnUrlVerifier: ReturnUrlVerifier,
                                conf: IdentityConfiguration,
                                api: IdApiClient,
                                idRequestParser : IdRequestParser,
                                idUrlBuilder : IdentityUrlBuilder,
                                authAction: utils.AuthAction)
  extends Controller with ExecutionContexts with SafeLogging {

  val page = IdentityPage("/email-prefs", "Email preferences", "email-prefs")

  val emailPrefsForm = Form(
    Forms.tuple(
      "receive_gnm_marketing" -> Forms.boolean,
      "receive_third_party_marketing" -> Forms.boolean,
      "email_format" -> Forms.text()
    )
  )

  def preferences = authAction.async { implicit request =>
    val idRequest = idRequestParser(request)
    api.join(
      api.user(request.user.getId(), request.auth),
      api.userEmails(request.user, idRequest.trackingData)
    ).map {
      case Right((user, subscriber)) => {
        Ok(views.html.email_prefs(page, idRequest, idUrlBuilder, user, subscriber))
      }
      case Left(errors) => Ok(errors.toString())
    }
  }
}
