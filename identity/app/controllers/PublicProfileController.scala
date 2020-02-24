package controllers

import com.gu.identity.model.User
import common.ImplicitControllerExecutionContext
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
        /**
          * Only render public profile if a user in Identity also exists in Discussion
          * and has one or more comments, otherwise return a no comments page.
          */
        discussionService.findDiscussionUserFilterCommented(user.id).map {
          case None =>
            implicit val identityPage: IdentityPage = IdentityPage(url, "public profile", usesGuardianHeader = true)
            renderPage(views.html.noDiscussionsPage(idRequestParser(request), idUrlBuilder, user, activityType))

          case Some(discussionUser) =>
            val title = s"${discussionUser.displayName}'s public profile"
            implicit val identityPage: IdentityPage = IdentityPage(url, title, usesGuardianHeader = true)
            renderPage(views.html.publicProfilePage(identityPage, idRequestParser(request), idUrlBuilder, user, discussionUser.displayName, activityType))
        }

    }
  }

  private def renderPage(content: Html)(implicit requestHeader: RequestHeader, identityPage: IdentityPage) = {
    Cached(60)(
      RevalidatableResult.Ok(
        IdentityHtmlPage.html(
          content
        )
      )
    )
  }
}
