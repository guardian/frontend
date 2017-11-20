package controllers.admin.commercial

import common.Logging
import model.{ApplicationContext, NoCache}
import play.api.data.Form
import play.api.data.Forms._
import play.api.i18n.I18nSupport
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import services.S3
import conf.Configuration.commercial.adsTextObjectKey

case class AdsTextSellers(sellers: String)

object AdsTextSellers {
    val form = Form(
      mapping(
        "sellers" -> nonEmptyText,
      )(AdsTextSellers.apply)(AdsTextSellers.unapply))
}

class AdsDotTextController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
  extends BaseController with I18nSupport with Logging {

  def renderAdsDotText(): Action[AnyContent] = Action { implicit request =>
    val content = Map("sellers" -> S3.get(adsTextObjectKey).getOrElse(""))

    NoCache(Ok(views.html.commercial.adsDotText(AdsTextSellers.form.bind(content))))
  }

  def postAdsDotText(): Action[AnyContent] = Action { implicit request =>
    AdsTextSellers.form.bindFromRequest.fold(
      formWithErrors => {
        NoCache(BadRequest(views.html.commercial.adsDotText(formWithErrors)))
      },
      adsTextSellers => {
        S3.putPrivate(adsTextObjectKey, adsTextSellers.sellers, "text/plain")
        log.info(s"Wrote new ads.txt file to ${adsTextObjectKey}")
        NoCache(Redirect(routes.AdsDotTextController.renderAdsDotText()))
      }
    )
  }

}