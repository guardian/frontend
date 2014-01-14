package controllers

import play.api.mvc._
import model.IdentityPage
import common.ExecutionContexts
import services.{IdentityUrlBuilder, IdRequestParser, ReturnUrlVerifier}
import com.google.inject.{Inject, Singleton}
import utils.SafeLogging
import conf.Switches


@Singleton
class FilmAwardsController @Inject()(returnUrlVerifier: ReturnUrlVerifier,
                                        idRequestParser: IdRequestParser,
                                        idUrlBuilder: IdentityUrlBuilder,
                                        authAction: actions.AuthAction)
  extends Controller with ExecutionContexts with SafeLogging {

  val page = IdentityPage("/film-awards", "Film Awards", "film-awards")

  def filmAwardsForm(formReference: String) = authAction.apply { implicit request =>
    if (Switches.IdentityFilmAwardsSwitch.isSwitchedOn) {
      val idRequest = idRequestParser(request)
      Ok(views.html.filmAwards.form(page, formReference, idRequest, idUrlBuilder))
    } else {
      logger.info(s"formstack switched off, attempt to access $formReference failed")
      NotFound(views.html.errors._404())
    }
  }

  def complete = Action { implicit request =>
    if (Switches.IdentityFilmAwardsSwitch.isSwitchedOn) {
      Ok(views.html.filmAwards.complete(page))
    } else {
      NotFound(views.html.errors._404())
    }
  }
}
