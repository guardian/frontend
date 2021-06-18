package controllers

import clients.DiscussionProfile
import com.gu.identity.model.User
import common.ImplicitControllerExecutionContext
import idapiclient.responses.Error
import idapiclient.{IdApiClient, Response}
import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, IdentityPage}
import pages.IdentityHtmlPage
import play.api.mvc._
import play.twirl.api.Html
import services.{DiscussionApiService, IdRequestParser, IdentityUrlBuilder}
import utils.SafeLogging

import scala.concurrent.Future

class PublicProfileController(
    idUrlBuilder: IdentityUrlBuilder,
    identityApiClient: IdApiClient,
    idRequestParser: IdRequestParser,
    discussionService: DiscussionApiService,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with SafeLogging {

  def renderProfileFromVanityUrl(vanityUrl: String, activityType: String): Action[AnyContent] =
    findProfileDataAndRender(
      "/user/" + vanityUrl,
      activityType,
      // IDAPI no longer supports lookup by Vanity URL. We return not found profile pages instead
      Future.successful(Left(List(Error("Not Found", "Not Found", 404)))),
    )

  def renderProfileFromId(id: String, activityType: String): Action[AnyContent] =
    findProfileDataAndRender("/user/id/" + id, activityType, identityApiClient.user(id))

  def findProfileDataAndRender(
      url: String,
      activityType: String,
      futureUser: => Future[Response[User]],
  ): Action[AnyContent] =
    Action.async { implicit request =>
      logger.info(
        s"PublicProfileController findProfileDataAndRender URI is ${request.uri} - Referer is ${request.headers.get("Referer")}",
      )

      futureUser.flatMap {
        case Left(errors) =>
          logger.info(s"public profile page returned errors ${errors.toString()}")
          Future.successful(renderUserNotFoundPage(url, request))

        case Right(user) =>
          /**
            * Only render public profile if a user in Identity also exists in Discussion
            * and has one or more comments, otherwise return a no comments page.
            */
          discussionService.findDiscussionUserFilterCommented(user.id).map {
            case None =>
              renderUserNotFoundPage(url, request)

            case Some(discussionUser) =>
              renderPublicProfilePage(url, activityType, request, user, discussionUser)
          }

      }
    }

  private def renderPublicProfilePage(
      url: String,
      activityType: String,
      request: Request[AnyContent],
      user: User,
      discussionUser: DiscussionProfile,
  )(implicit requestHeader: RequestHeader) = {
    val title = s"${discussionUser.displayName}'s public profile"
    implicit val identityPage: IdentityPage = IdentityPage(url, title, usesGuardianHeader = true)
    renderPage(
      views.html.publicProfilePage(
        identityPage,
        idRequestParser(request),
        idUrlBuilder,
        user,
        discussionUser.displayName,
        activityType,
      ),
    )
  }

  private def renderUserNotFoundPage(url: String, request: Request[AnyContent])(implicit
      requestHeader: RequestHeader,
  ) = {
    implicit val identityPage: IdentityPage = IdentityPage(url, "public profile", usesGuardianHeader = true)
    renderPage(views.html.noDiscussionsPage(idRequestParser(request), idUrlBuilder))
  }

  private def renderPage(content: Html)(implicit requestHeader: RequestHeader, identityPage: IdentityPage) = {
    Cached(60)(
      RevalidatableResult.Ok(
        IdentityHtmlPage.html(
          content,
        ),
      ),
    )
  }
}
