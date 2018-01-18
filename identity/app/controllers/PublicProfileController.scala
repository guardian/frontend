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
    with SafeLogging{

  def page(url: String, username: String): IdentityPage = IdentityPage(url,  s"$username's public profile")

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
          user.publicFields.displayName.map { displayName =>
            val idRequest = idRequestParser(request)
            Cached(60)(RevalidatableResult.Ok(
              IdentityHtmlPage.html(views.html.publicProfilePage(page(url, displayName), idRequest, idUrlBuilder, user, activityType))(page(url, displayName), request, context)
            ))
          } getOrElse NotFound(views.html.errors._404())
      }
  }
}
