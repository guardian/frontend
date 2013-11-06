package actions

import play.api.mvc.{WrappedRequest, Request}
import com.gu.identity.model.User
import client.Auth

case class AuthRequest[A](request: Request[A], user: User, auth: Auth) extends WrappedRequest(request)
