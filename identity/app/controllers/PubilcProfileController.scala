package controllers

import play.api.mvc._
import common.ExecutionContexts
import services.{IdRequestParser, IdentityUrlBuilder}
import com.google.inject.{Inject, Singleton}
import utils.SafeLogging
import model.IdentityPage
import play.api.data.{Forms, Form}
import idapiclient.{IdApiClient, UserUpdate}
import com.gu.identity.model.{PrivateFields, PublicFields, User}
import actions.AuthActionWithUser


@Singleton
class PubilcProfileController @Inject()(idUrlBuilder: IdentityUrlBuilder,
                                        authActionWithUser: AuthActionWithUser,
                                        identityApiClient: IdApiClient,
                                        idRequestParser: IdRequestParser)
  extends Controller with ExecutionContexts with SafeLogging {

  val form = Form(
    Forms.tuple(
      "publicFields.location" -> Forms.optional(Forms.text(maxLength = 255)),
      "privateFields.gender" -> Forms.optional(Forms.text).verifying { genderOpt =>
        genderOpt.map(List("Male", "Female", "unknown", "").contains(_)).getOrElse(true)
      },
      "publicFields.aboutMe" -> Forms.optional(Forms.text(maxLength = 1500)),
      "publicFields.interests" -> Forms.optional(Forms.text(maxLength = 255)),
      "publicFields.webPage" -> Forms.optional(Forms.text(maxLength = 255))
    )
  )

  val page = IdentityPage("/profile/public", "Public profile", "public profile")

  def displayForm = authActionWithUser.apply { implicit request =>
    val idRequest = idRequestParser(request)
    Ok(views.html.public_profile(page.tracking(idRequest), idRequest, idUrlBuilder, bindFormFromUser(request.user)))
  }

  def bindFormFromUser(user: User): Form[(Option[String], Option[String], Option[String], Option[String], Option[String])] = {
    form.bind(
      List(
        user.publicFields.location.map("publicFields.location" -> _),
        user.privateFields.gender.map("privateFields.gender" -> _),
        user.publicFields.aboutMe.map("publicFields.aboutMe" -> _),
        user.publicFields.interests.map("publicFields.interests" -> _),
        user.publicFields.webPage.map("publicFields.webPage" -> _)
      ).flatten.toMap
    )
  }

  def submitForm = authActionWithUser.async { implicit request =>
    val idRequest = idRequestParser(request)
    val formData = form.bindFromRequest()

    val userUpdate = UserUpdate(
      publicFields = Some(PublicFields(
        location = formData("publicFields.location").value,
        aboutMe = formData("publicFields.aboutMe").value,
        interests = formData("publicFields.interests").value,
        webPage = formData("publicFields.webPage").value
      )),
      privateFields = Some(PrivateFields(
        gender = formData("privateFields.gender").value
      ))
    )

    identityApiClient.saveUser(request.user.id, userUpdate, request.auth).map {
      case Left(errors) => {
        val formDataWithErrors = errors.foldLeft(formData) { (formWithErrors,error) =>
          formWithErrors.withError(error.context.getOrElse(""), error.description)
        }
        Ok(views.html.public_profile(page.tracking(idRequest), idRequest, idUrlBuilder, formDataWithErrors))
      }
      case Right(user) => {
        Ok(views.html.public_profile(page.accountEdited(idRequest), idRequest, idUrlBuilder, bindFormFromUser(user)))
      }
    }
  }
}
