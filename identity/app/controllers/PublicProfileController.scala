package controllers

import play.api.mvc._
import common.ExecutionContexts
import services.{IdRequestParser, IdentityUrlBuilder}
import com.google.inject.{Inject, Singleton}
import utils.SafeLogging
import model.{Cached, IdentityPage}
import idapiclient.IdApiClient
import scala.concurrent.Future
import com.gu.identity.model.User
import client.Response

@Singleton
class PublicProfileController @Inject()(idUrlBuilder: IdentityUrlBuilder,
                                        identityApiClient: IdApiClient,
                                        idRequestParser: IdRequestParser)
  extends Controller
  with ExecutionContexts
  with SafeLogging{

  def page(url: String, username: Option[String]) = IdentityPage(url, username.get +"'s public profile", "public profile")

  def renderProfileFromVanityUrl(vanityUrl: String) = renderPublicProfilePage(
    "/user/" + vanityUrl,
    identityApiClient.userFromVanityUrl(vanityUrl)
  )

  def renderProfileFromId(id: String) = renderPublicProfilePage("/user/id/"+id, identityApiClient.user(id))

  def renderPublicProfilePage(url: String, futureUser: => Future[Response[User]]) = Action.async {
    implicit request =>
      futureUser map {
        case Left(errors) =>
          print(errors)
          logger.info(s"public profile page returned errors ${errors.toString()}")
          NotFound(views.html.errors._404())

        case Right(user) =>
          val idRequest = idRequestParser(request)
          Cached(60)(Ok(views.html.publicProfilePage(page(url, user.publicFields.displayName), idRequest, idUrlBuilder, user)))
      }
  }
}
