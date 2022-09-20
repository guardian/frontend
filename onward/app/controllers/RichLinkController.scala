package controllers

import common.`package`.convertApiExceptionsWithoutEither
import common.{Edition, GuLogging, ImplicitControllerExecutionContext, JsonComponent}
import contentapi.ContentApiClient
import implicits.Requests
import model.{ApplicationContext, Cached, Content, ContentFormat, ContentType}
import models.dotcomrendering.{RichLink, RichLinkTag}
import model.dotcomrendering.TrailUtils
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
      val resp = contentType(path) map {
        case Some(content) if request.forceDCR =>
          val richLink = RichLink(
            tags =
              content.tags.tags.map(t => RichLinkTag(t.properties.id, t.properties.tagType, t.properties.webTitle)),
            cardStyle = content.content.cardStyle.toneString,
            thumbnailUrl = content.trail.trailPicture.flatMap(tp => Item460.bestSrcFor(tp)),
            imageAsset = content.trail.trailPicture.flatMap(tp => Item460.bestFor(tp)),
            headline = content.trail.headline,
            contentType = content.metadata.contentType,
            starRating = content.content.starRating,
            sponsorName = content.metadata.commercial.flatMap(_.branding(Edition(request))).map(_.sponsorName),
            contributorImage = content.tags.contributors.headOption
              .flatMap(_.properties.contributorLargeImagePath.map(ImgSrc(_, RichLinkContributor))),
            url = content.metadata.url,
            pillar = TrailUtils.normalisePillar(content.metadata.pillar),
            format = content.metadata.format.getOrElse(ContentFormat.defaultContentFormat),
          )
          Cached(900)(JsonComponent.fromWritable(richLink)(request, RichLink.writes))
        case Some(content) => renderContent(richLinkHtml(content), richLinkBodyHtml(content))
        case None          => NotFound
      }

      resp.recover(convertApiExceptionsWithoutEither)
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
