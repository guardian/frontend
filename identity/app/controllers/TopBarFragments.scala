package controllers


import com.google.inject.Inject
import com.gu.identity.cookie.{GuUDecoder, GuUCookieData}
import conf.FrontendIdentityCookieDecoder
import play.api.mvc._
import common.{Logging, ExecutionContexts, renderFormat}

class TopBarFragments @Inject()(cookieDecoder: FrontendIdentityCookieDecoder) extends Controller with Logging {
  def signin = Action { implicit request =>
    renderFormat(
      () => {
        request.cookies.get("GU_U")
          .flatMap(cookie => cookieDecoder.getUserDataForGuU(cookie.value))
          .map(cookieData => views.html.topbar.signedin(cookieData))
          .getOrElse(views.html.topbar.notsignedin())
      },
      3600
    )
  }

  val signin2 = signin
}
