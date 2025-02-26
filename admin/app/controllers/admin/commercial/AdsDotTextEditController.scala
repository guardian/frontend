package controllers.admin.commercial

import common.GuLogging
import model.{ApplicationContext, NoCache}
import play.api.data.Form
import play.api.data.Forms._
import play.api.i18n.I18nSupport
import play.api.mvc.{Action, AnyContent, BaseController, Call, ControllerComponents}
import services.S3
import conf.Configuration.commercial.{adsTextObjectKey, appAdsTextObjectKey}

case class AdsTextSellers(sellers: String)

object AdsTextSellers {
  val form = Form(
    mapping(
      "sellers" -> nonEmptyText,
    )(AdsTextSellers.apply)(AdsTextSellers.unapply),
  )
}

class AdsDotTextEditController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
    extends BaseController
    with I18nSupport
    with GuLogging {

  final private def renderDotText(name: String, s3DotTextKey: String, saveRoute: Call): Action[AnyContent] =
    Action { implicit request =>
      val content = Map("sellers" -> S3.get(s3DotTextKey).getOrElse(""))
      NoCache(Ok(views.html.commercial.adsDotText(name, saveRoute, AdsTextSellers.form.bind(content))))
    }

  def renderAdsDotText(): Action[AnyContent] =
    renderDotText("ads.txt", adsTextObjectKey, routes.AdsDotTextEditController.postAdsDotText())
  def renderAppAdsDotText(): Action[AnyContent] =
    renderDotText("app-ads.txt", appAdsTextObjectKey, routes.AdsDotTextEditController.postAppAdsDotText())

  final private def postDotText(
      name: String,
      s3DotTextKey: String,
      saveRoute: Call,
      postSave: Call,
  ): Action[AnyContent] =
    Action { implicit request =>
      AdsTextSellers.form
        .bindFromRequest()
        .fold(
          formWithErrors => {
            NoCache(BadRequest(views.html.commercial.adsDotText(name, saveRoute, formWithErrors)))
          },
          adsTextSellers => {
            S3.putPrivate(s3DotTextKey, adsTextSellers.sellers, "text/plain")
            logInfoWithRequestId(s"Wrote new $name file to $s3DotTextKey")
            NoCache(Redirect(postSave))
          },
        )
    }

  def postAdsDotText(): Action[AnyContent] =
    postDotText(
      "ads.txt",
      adsTextObjectKey,
      routes.AdsDotTextEditController.postAdsDotText(),
      routes.AdsDotTextEditController.renderAdsDotText(),
    )

  def postAppAdsDotText(): Action[AnyContent] =
    postDotText(
      "app-ads.txt",
      appAdsTextObjectKey,
      routes.AdsDotTextEditController.postAppAdsDotText(),
      routes.AdsDotTextEditController.renderAppAdsDotText(),
    )

}
