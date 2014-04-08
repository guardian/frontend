package controllers

import play.api.mvc.Controller
import common.Logging
import play.api.data._
import play.api.data.Forms._
import controllers.admin.Authenticated
import services.Redirects


case class PageRedirect(from: String, to: String) {
  lazy val trim = this.copy(from = from.trim, to = to.trim)
}
object RedirectController  extends Controller with Logging {


  val redirectForm = Form(mapping("from" -> text, "to" -> text)(PageRedirect.apply)(PageRedirect.unapply))

  def redirect() = Authenticated { request =>
    Ok(views.html.redirects(redirectForm))
  }

  def redirectPost() = Authenticated { implicit request =>

    redirectForm.bindFromRequest().get.trim match {
      case PageRedirect(from, "") if from.nonEmpty  => Redirects.remove(from)
      case PageRedirect(from, to) if from.nonEmpty  => Redirects.set(from, to)
      case _ =>
    }

    SeeOther(routes.RedirectController.redirect().url)
  }

}
