package views

import views.SocialSigninRoute.Request

object SocialErrorMapper {
  def route(registrationErrorOpt: Option[String], routes: SocialSigninRoutes): SocialSigninRoutes =
    registrationErrorOpt
      .filter(_ == "fbEmail")
      .map(_ => views.SocialSigninRoutes(Request, routes.google))
      .getOrElse(routes)
}
