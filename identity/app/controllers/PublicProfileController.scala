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
import play.filters.csrf.{CSRFCheck, CSRFAddToken}


@Singleton
class PublicProfileController @Inject()(idUrlBuilder: IdentityUrlBuilder,
                                        authActionWithUser: AuthActionWithUser,
                                        identityApiClient: IdApiClient,
                                        idRequestParser: IdRequestParser)
  extends Controller with ExecutionContexts with SafeLogging {

  val publicProfileForm = Form(
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

  val textField = Forms.optional(Forms.text(maxLength = 255))
  
  val accountDetailsForm = Form(
    Forms.tuple(
      "primaryEmailAddress" -> textField,
      "password1" -> textField,
      "password2" -> textField,
      "privateFields.firstName" -> textField,
      "privateFields.secondName" -> textField
    )
  )

  val page = IdentityPage("/profile/public", "Public profile", "public profile")

  def displayForm = CSRFAddToken {
    authActionWithUser.apply { implicit request =>
      val idRequest = idRequestParser(request)
      Ok(views.html.public_profile(page.tracking(idRequest), request.user, bindPublicProfileFormFromUser(request.user), bindAccountDetailsFormFromUser(request.user), idRequest, idUrlBuilder))
    }
  }

  def bindPublicProfileFormFromUser(user: User): Form[(Option[String], Option[String], Option[String], Option[String], Option[String])] = {
    publicProfileForm.bind(
      List(
        user.publicFields.location.map("publicFields.location" -> _),
        user.privateFields.gender.map("privateFields.gender" -> _),
        user.publicFields.aboutMe.map("publicFields.aboutMe" -> _),
        user.publicFields.interests.map("publicFields.interests" -> _),
        user.publicFields.webPage.map("publicFields.webPage" -> _)
      ).flatten.toMap
    )
  }

  def bindAccountDetailsFormFromUser(user: User): Form[(Option[String], Option[String], Option[String], Option[String], Option[String])] = {
    accountDetailsForm.bind(
      List(
        user.primaryEmailAddress.map("primaryEmailAddress" -> _),
        user.primaryEmailAddress.map("primaryEmailAddress" -> _),
        user.primaryEmailAddress.map("primaryEmailAddress" -> _),
        user.privateFields.firstName.map("privateFields.firstName" -> _),
        user.privateFields.secondName.map("privateFields.secondName" -> _)
      ).flatten.toMap
    )
  }

  def submitForm = CSRFCheck {
    authActionWithUser.async { implicit request =>
      val idRequest = idRequestParser(request)
      val formData = publicProfileForm.bindFromRequest()

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
          Ok(views.html.public_profile(page.tracking(idRequest), request.user, formDataWithErrors, idRequest, idUrlBuilder))
        }
        case Right(user) => {
          Ok(views.html.public_profile(page.accountEdited(idRequest), request.user, bindPublicProfileFormFromUser(user), idRequest, idUrlBuilder))
        }
      }
    }
  }
}
