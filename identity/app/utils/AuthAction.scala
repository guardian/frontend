package utils

import play.api.mvc.{SimpleResult, ActionBuilder, Request}
import com.gu.identity.model.User
import scala.concurrent.Future
import conf.FrontendIdentityCookieDecoder
import com.google.inject.Inject
import play.api.mvc.Results.SeeOther
import services.{IdentityUrlBuilder, IdRequestParser}
import play.mvc.BodyParser.AnyContent


case class AuthRequest[A](request: Request[A], user: User)
object AuthRequest {
  implicit def toRequest[A](authRequest: AuthRequest[A]): Request[A] = authRequest.request
}

@Singleton
class AuthAction @Inject()(cookieDecoder: FrontendIdentityCookieDecoder,
                           idRequestParser: IdRequestParser,
                           identityUrlBuilder: IdentityUrlBuilder)
  extends ActionBuilder[AuthRequest] {

  protected def invokeBlock[A >: AnyContent](request: Request[A], block: (AuthRequest[A]) => Future[SimpleResult]) = {
    request.cookies.get("SC_GU_U").flatMap { cookie =>
      cookieDecoder.getUserDataForScGuU(cookie.value)
    } match {
      case Some(user) => block(AuthRequest(request, user))
      case None => Future.successful(SeeOther(identityUrlBuilder.buildUrl("/signin", idRequestParser(request))))
    }
  }
}
