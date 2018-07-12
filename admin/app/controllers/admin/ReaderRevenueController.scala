package controllers.admin

import common.{ImplicitControllerExecutionContext, Logging}
import model._
import play.api.mvc._



class ReaderRevenueController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
   extends BaseController with Logging with ImplicitControllerExecutionContext {

  def renderReaderRevenueMenu(): Action[AnyContent] = Action { implicit request =>
    NoCache(Ok(views.html.readerRevenue.readerRevenueMenu()))
  }

  def renderBannerDeploys: Action[AnyContent] = Action { implicit request =>
    NoCache(Ok(views.html.readerRevenue.bannerDeploys()))
  }

  def redeployBanner: Action[AnyContent] = Action { implicit request =>
    NoCache(Ok("dummy response"))
  }

}
