package controllers.admin

import common.Logging
import model.{ApplicationContext, MegaSlotMeta}
import play.api.data.Form
import play.api.data.Forms._
import play.api.i18n.I18nSupport
import play.api.libs.json.Json
import play.api.mvc._
import services.S3Megaslot

class MegaMostViewedController(
  val controllerComponents: ControllerComponents
)(implicit context: ApplicationContext)
  extends BaseController with Logging with I18nSupport {

  val slotForm = Form(
    mapping(
      "headline" -> text,
      "uk" -> text,
      "us" -> text,
      "au" -> text,
      "row" -> text
    )(MegaSlotMeta.apply)(MegaSlotMeta.unapply)
  )

  val mostCommentedTitle = "Most Commented slots"
  val onSocialTitle = "Most social referrals slots"
  val mostCommentedSource = "most-commented.json"
  val onSocialSource = "on-social.json"

  def getMostCommented(): Action[AnyContent] = Action { implicit request =>
    get(mostCommentedTitle, mostCommentedSource, routes.MegaMostViewedController.setMostCommented())
  }

  def getOnSocial(): Action[AnyContent] = Action { implicit request =>
    get(onSocialTitle, onSocialSource, routes.MegaMostViewedController.setOnSocial())
  }

  private[this] def get(title: String, key: String, action: Call)(implicit request: Request[AnyContent]): Result = {
    val data = S3Megaslot.get(key).map(blob =>Json.parse(blob))

    val form = data match {
      case Some(jsValue) => slotForm.bind(jsValue)
      case None => slotForm
    }

    Ok(views.html.megaSlotForm(title, form, action))
  }

  def setOnSocial(): Action[AnyContent] = Action { implicit request =>
    set(
      title = onSocialTitle,
      key = "on-social.json",
      action = routes.MegaMostViewedController.setOnSocial(),
      redirectTo = routes.MegaMostViewedController.getOnSocial()
    )
  }

  def setMostCommented(): Action[AnyContent] = Action { implicit request =>
    set(
      title = mostCommentedTitle,
      key = "most-commented.json",
      action = routes.MegaMostViewedController.setMostCommented,
      redirectTo = routes.MegaMostViewedController.getMostCommented
    )
  }

  private[this] def set(title: String, key: String, action: Call, redirectTo: Call)(implicit request: Request[AnyContent]): Result = {
    slotForm.bindFromRequest.fold(
      formWithErrors => {
        BadRequest(views.html.megaSlotForm(title, formWithErrors, action))
      },
      meta => {
        S3Megaslot.putPublic(key, Json.toJson(meta).toString(), "application/json")
        Redirect(redirectTo)
      }
    )
  }


}
