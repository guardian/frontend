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

  def page(url: String, username: String) = IdentityPage(url,  s"$username's public profile", "public profile")

  def renderProfileFromVanityUrl(vanityUrl: String, activityType: String) = renderPublicProfilePage(
    "/user/" + vanityUrl,
    activityType,
    identityApiClient.userFromVanityUrl(vanityUrl)
  )

  def renderProfileFromId(id: String, activityType: String) = renderPublicProfilePage("/user/id/"+id, activityType, identityApiClient.user(id))

  def renderPublicProfilePage(url: String, activityType: String, futureUser: => Future[Response[User]]) = Action.async {
    implicit request =>
      futureUser map {
        case Left(errors) =>
          logger.info(s"public profile page returned errors ${errors.toString()}")
          NotFound(views.html.errors._404())

        case Right(user) =>
          user.publicFields.displayName.map { displayName =>
            val idRequest = idRequestParser(request)
            Cached(60)(Ok(views.html.publicProfilePage(
              page(url, displayName), idRequest, idUrlBuilder, user, activityType)))
          } getOrElse NotFound(views.html.errors._404())
      }
  }
}
