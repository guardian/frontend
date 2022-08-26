package controllers.admin.commercial

import common.dfp.TakeoverWithEmptyMPUs
import model.{ApplicationContext, NoCache}
import play.api.i18n.I18nSupport
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

class TakeoverWithEmptyMPUsController(val controllerComponents: ControllerComponents)(implicit
    context: ApplicationContext,
) extends BaseController
    with I18nSupport {

  def viewList(): Action[AnyContent] =
    Action { implicit request =>
      NoCache(Ok(views.html.commercial.takeoverWithEmptyMPUs(TakeoverWithEmptyMPUs.fetchSorted())))
    }

  def viewForm(): Action[AnyContent] =
    Action { implicit request =>
      NoCache(Ok(views.html.commercial.takeoverWithEmptyMPUsCreate(TakeoverWithEmptyMPUs.form)))
    }

  def create(): Action[AnyContent] =
    Action { implicit request =>
      TakeoverWithEmptyMPUs.form
        .bindFromRequest()
        .fold(
          formWithErrors => {
            NoCache(BadRequest(views.html.commercial.takeoverWithEmptyMPUsCreate(formWithErrors)))
          },
          takeover => {
            TakeoverWithEmptyMPUs.create(takeover)
            NoCache(Redirect(routes.TakeoverWithEmptyMPUsController.viewList()))
          },
        )
    }

  def remove(url: String): Action[AnyContent] =
    Action { implicit request =>
      TakeoverWithEmptyMPUs.remove(url)
      NoCache(Redirect(routes.TakeoverWithEmptyMPUsController.viewList()))
    }
}
