package controllers

import common.{Edition, ImplicitControllerExecutionContext, JsonComponent, GuLogging}
import contentapi.ContentApiClient
import implicits.Requests
import model.{ApplicationContext, Cached, Content, ContentType}
import models.dotcomponents.{OnwardsUtils, RichLink, RichLinkTag}
import play.api.mvc.{Action, AnyContent, ControllerComponents, RequestHeader}
import play.twirl.api.Html
import views.support.{ImgSrc, Item460, RichLinkContributor}

import scala.concurrent.Future

class RichLinkController(contentApiClient: ContentApiClient, controllerComponents: ControllerComponents)(implicit
    context: ApplicationContext,
) extends OnwardContentCardController(contentApiClient, controllerComponents)
    with Paging
    with GuLogging
    with ImplicitControllerExecutionContext
    with Requests {
  def render(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      contentType(path) map {
        case Some(content) if request.forceDCR =>
          val richLink = RichLink(
            tags =
              content.tags.tags.map(t => RichLinkTag(t.properties.id, t.properties.tagType, t.properties.webTitle)),
            cardStyle = content.content.cardStyle.toneString,
            thumbnailUrl = content.trail.trailPicture.flatMap(tp => Item460.bestSrcFor(tp)),
            headline = content.trail.headline,
            contentType = content.metadata.contentType,
            starRating = content.content.starRating,
            sponsorName = content.metadata.commercial.flatMap(_.branding(Edition(request))).map(_.sponsorName),
            contributorImage = content.tags.contributors.headOption
              .flatMap(_.properties.contributorLargeImagePath.map(ImgSrc(_, RichLinkContributor))),
            url = content.metadata.url,
            pillar = OnwardsUtils.determinePillar(content.metadata.pillar),
          )
          Cached(900)(JsonComponent(richLink)(request, RichLink.writes))
        case Some(content) => renderContent(richLinkHtml(content), richLinkBodyHtml(content))
        case None          => NotFound
      }
    }

  private def contentType(path: String)(implicit request: RequestHeader): Future[Option[ContentType]] = {
    val fields = "headline,standfirst,shortUrl,webUrl,byline,starRating,trailText,liveBloggingNow"
    val response = lookup(path, fields)(request)
    response.map(_.content.map(Content(_)))
  }

  private def richLinkHtml(content: ContentType)(implicit request: RequestHeader, context: ApplicationContext): Html =
    views.html.richLink(content)(request, context)

  private def richLinkBodyHtml(
      content: ContentType,
  )(implicit request: RequestHeader, context: ApplicationContext): Html =
    views.html.fragments.richLinkBody(content)(request)

}
