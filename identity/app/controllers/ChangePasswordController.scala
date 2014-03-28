package controllers

import client._
import common.ExecutionContexts
import com.google.inject.Inject
import com.gu.identity.model.User
import javax.inject.Singleton
import model.IdentityPage
import actions.AuthActionWithUser
import play.api.mvc._
import play.api.data._
import play.api.mvc.SimpleResult
import scala.concurrent.Future
import services._
import utils.SafeLogging
import form.Mappings
import idapiclient.IdApiClient


@Singleton
class ChangePasswordController @Inject()( api: IdApiClient,
                                             authActionWithUser: AuthActionWithUser,
                                             idRequestParser: IdRequestParser,
                                             idUrlBuilder: IdentityUrlBuilder)
  extends Controller with ExecutionContexts with SafeLogging with Mappings {
  import ValidationState._

  val page = IdentityPage("/password/change", "Change Password", "change-password")

  val passwordForm = Form(
    Forms.tuple(
      ("oldPassword", idPassword),
      ("newPassword1", idPassword),
      ("newPassword2", idPassword)
    )
  )

  def renderChangePasswordPage = Action{ implicit request =>
    logger.trace("Rendering password change form")

    val idRequest = idRequestParser(request)
    val filledForm = passwordForm.fill("","","")
    Ok(views.html.change_password(page.registrationStart(idRequest), idRequest, idUrlBuilder, filledForm ))
  }
}
