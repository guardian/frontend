package views

case class SocialSigninRoute(name: String, path: String)

object SocialSigninRoute {

  object Signin extends SocialSigninRoute("Sign in", "signin")
  object Register extends SocialSigninRoute("Register", "signin")
  object Request extends SocialSigninRoute("Register", "request")
  object Confirm extends SocialSigninRoute("Confirm", "confirm")

}
