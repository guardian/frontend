package controllers

import play.api.mvc.{Controller, Action}
import com.google.inject.{Inject, Singleton}
import idapiclient.IdApiClient
import services.{IdentityUrlBuilder, IdRequestParser}
import common.ExecutionContexts
import utils.SafeLogging
import model.IdentityPage

@Singleton
class EmailVerificationController @Inject()( api : IdApiClient, idRequestParser: IdRequestParser, idUrlBuilder: IdentityUrlBuilder )
  extends Controller with ExecutionContexts with SafeLogging {

  val page = IdentityPage("/verify-email", "Verify Email", "verify-email")

  def verify( token : String) = Action { implicit request =>
    val idRequest = idRequestParser(request)
    Ok(views.html.email_verified(page, idRequest, idUrlBuilder))
  }

}
