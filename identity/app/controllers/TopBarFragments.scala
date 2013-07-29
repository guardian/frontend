package controllers

import com.google.inject.Inject
import com.gu.identity.cookie.{GuUDecoder, GuUCookieData}
import conf.FrontendIdentityCookieDecoder
import play.api.mvc._
import common.{Logging, ExecutionContexts}

class TopBarFragments @Inject()(cookieDecoder: FrontendIdentityCookieDecoder) extends Controller with Logging {
  def signin = Action { implicit request =>
    request.cookies.get("GU_U")
      .flatMap(cookie => cookieDecoder.getUserDataForGuU(cookie.value))
      .map(cookieData => Ok(views.html.fragments.topbar.signedin(cookieData)))
      .getOrElse(Ok(views.html.fragments.topbar.notsignedin()))

  }

}
