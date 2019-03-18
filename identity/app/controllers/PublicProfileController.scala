package controllers

import model.Cached.RevalidatableResult
import play.api.mvc._
import common.ImplicitControllerExecutionContext
import services.{IdRequestParser, IdentityUrlBuilder}
import utils.SafeLogging
import model.{ApplicationContext, Cached, IdentityPage}
import idapiclient.{IdApiClient, Response}

import scala.concurrent.Future
import com.gu.identity.model.User
import pages.IdentityHtmlPage

class PublicProfileController(
  idUrlBuilder: IdentityUrlBuilder,
  identityApiClient: IdApiClient,
  idRequestParser: IdRequestParser,
  val controllerComponents: ControllerComponents
)(implicit context: ApplicationContext)
  extends BaseController
    with ImplicitControllerExecutionContext
    with SafeLogging {

  def page(url: String, username: String): IdentityPage = IdentityPage(url,  s"$username's public profile", usesGuardianHeader=true)

  def renderProfileFromVanityUrl(vanityUrl: String, activityType: String): Action[AnyContent] = renderPublicProfilePage(
    "/user/" + vanityUrl,
    activityType,
    identityApiClient.userFromVanityUrl(vanityUrl)
  )

  def renderProfileFromId(id: String, activityType: String): Action[AnyContent] = renderPublicProfilePage("/user/id/"+id, activityType, identityApiClient.user(id))

  def renderPublicProfilePage(url: String, activityType: String, futureUser: => Future[Response[User]]): Action[AnyContent] = Action.async {
    implicit request =>
      futureUser map {
        case Left(errors) =>
          logger.info(s"public profile page returned errors ${errors.toString()}")
          NotFound(views.html.errors._404())

        case Right(user) =>
          // When a user signs up through profile.theguardian.com with an email address,
          // their display name is first name, last name and their username is empty.
          // If they go to comment, they are prompted to set a username which is used as the display name.
          // Since the user has publicised this information (via commenting), we are ok making it public too.
          //
          // Conversely if username hasn't been set, we don't want to use their display name,
          // since it could be (by default) first name, last name; something the user might not want displayed.
          // In these cases, default to using their identity id instead of e.g. a not found response.
          // This behaviour means that in edge cases where a user has commented but hasn't got a username
          // (possible on e.g. apps) and someone has clicked through on their profile from comments,
          // they'll still see their comment history.
          val displayName = user.publicFields.username.getOrElse(user.id)
          val idRequest = idRequestParser(request)
          Cached(60)(RevalidatableResult.Ok(
            IdentityHtmlPage.html(views.html.publicProfilePage(page(url, displayName), idRequest, idUrlBuilder, user, activityType))(page(url, displayName), request, context)
          ))
      }
  }
}
