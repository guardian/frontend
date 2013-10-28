package controllers

import play.api.mvc._
import common.ExecutionContexts
import services.IdentityUrlBuilder
import com.google.inject.{Inject, Singleton}
import utils.{UserFromApiActionBuilder, SafeLogging}
import model.IdentityPage
import play.api.data.{Forms, Form}


@Singleton
class PubilcProfileController @Inject()(idUrlBuilder: IdentityUrlBuilder, userFromApiAction: UserFromApiActionBuilder)
  extends Controller with ExecutionContexts with SafeLogging {

  val form = Form(
    Forms.tuple(
      "publicFields.location" -> Forms.optional(Forms.text(maxLength = 255)),
      "privateFields.gender" -> Forms.optional(Forms.text),
      "publicFields.aboutMe" -> Forms.optional(Forms.text(maxLength = 1500)),
      "publicFields.interests" -> Forms.optional(Forms.text(maxLength = 255)),
      "publicFields.webPage" -> Forms.optional(Forms.text(maxLength = 255))
    )
  )

  val page = IdentityPage("/profile/public", "Public profile", "public profile")

  def displayForm = userFromApiAction.apply { implicit request =>
    val populatedForm = form.bind(
     List(
       request.user.publicFields.location.map("publicFields.location" -> _),
       request.user.privateFields.gender.map("privateFields.gender" -> _),
       request.user.publicFields.aboutMe.map("publicFields.aboutMe" -> _),
       request.user.publicFields.interests.map("publicFields.interests" -> _),
       request.user.publicFields.webPage.map("publicFields.webPage" -> _)
     ).flatten.toMap
    )

    Ok(views.html.public_profile(page.registrationStart(request.identityRequest), request.identityRequest, idUrlBuilder, populatedForm))
  }
}
