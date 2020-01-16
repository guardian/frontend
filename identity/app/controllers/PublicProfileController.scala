package controllers

import model.Cached.RevalidatableResult
import play.api.mvc._
import common.ImplicitControllerExecutionContext
import services.{DiscussionApiService, DiscussionApiServiceException, IdRequestParser, IdentityUrlBuilder}
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
                               discussionApi: DiscussionApiService,
                               val controllerComponents: ControllerComponents
                             )(implicit context: ApplicationContext)
  extends BaseController
  with ImplicitControllerExecutionContext
  with SafeLogging {

  def renderProfileFromVanityUrl(vanityUrl: String, activityType: String): Action[AnyContent] = renderPublicProfilePage(
    "/user/" + vanityUrl,
    activityType,
    identityApiClient.userFromVanityUrl(vanityUrl)
  )

  def renderProfileFromId(id: String, activityType: String): Action[AnyContent] = renderPublicProfilePage("/user/id/" + id, activityType, identityApiClient.user(id))

  def renderPublicProfilePage(url: String, activityType: String, futureUser: => Future[Response[User]]): Action[AnyContent] = Action.async { implicit request =>
    futureUser.flatMap {
      case Left(errors) =>
        logger.info(s"public profile page returned errors ${errors.toString()}")
        Future {
          NotFound(views.html.errors._404())
        }

      case Right(user) =>
        discussionApi.userHasPublicProfile(user.id).value map {
          case Left(error) =>
            logger.info(s"public profile page returned error: ${error.message}")
            NotFound(views.html.errors._404())

          case Right(false) =>
            logger.info(s"public profile page returned error: user ${user.id} found in Discussion but does not have a public profile")
            NotFound(views.html.errors._404())

          case Right(true) =>
            val title = user.publicFields.username.fold("public profile")(username => s"$username's public profile") // TODO
            implicit val identityPage: IdentityPage = IdentityPage(url, title, usesGuardianHeader = true)

            Cached(60)(
              RevalidatableResult.Ok(
                IdentityHtmlPage.html(
                  views.html.publicProfilePage(identityPage, idRequestParser(request), idUrlBuilder, user, activityType)
                )
              )
            )
        }

    }
  }

}
