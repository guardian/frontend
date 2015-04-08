package views

import views.SocialSigninRoute.{Signin, Request}

object SocialErrorMapper {
  def route(registrationErrorOpt: Option[String]): SocialSigninRoute =
    registrationErrorOpt.filter(_ == "fbEmail").map(_ => Request).getOrElse(Signin)
}
