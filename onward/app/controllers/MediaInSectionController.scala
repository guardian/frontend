package controllers

import com.gu.contentapi.client.GuardianContentApiError
import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import common._
import contentapi.ContentApiClient
import implicits.Requests
import layout.{CollectionEssentials, FaciaContainer}
import model._
import model.pressed.CollectionConfig
import play.api.mvc.{Action, Controller, RequestHeader}
import services.CollectionConfigWithId
import layout.slices.{Fixed, FixedContainers}

import scala.concurrent.Future

class MediaInSectionController(contentApiClient: ContentApiClient)(implicit context: ApplicationContext) extends Controller with Logging with Paging with ExecutionContexts with Requests {
  // These exist to work around the absence of default values in Play routing.
  def renderSectionMediaWithSeries(mediaType: String, sectionId: String, seriesId: String) =
    renderMedia(mediaType, sectionId, Some(seriesId))
  def renderSectionMedia(mediaType: String, sectionId: String) = renderMedia(mediaType, sectionId, None)

  private def renderMedia(mediaType: String, sectionId: String, seriesId: Option[String]) = Action.async { implicit request =>
    val response = lookup(Edition(request), mediaType, sectionId, seriesId) map { seriesItems =>
      seriesItems map { trail => renderSectionTrails(mediaType, trail, sectionId) }
    }
    response map { _ getOrElse NotFound }
  }

  private def lookup(edition: Edition, mediaType: String, sectionId: String, seriesId: Option[String])(implicit request: RequestHeader): Future[Option[Seq[RelatedContentItem]]] = {
    val currentShortUrl = request.getQueryString("shortUrl").getOrElse("")
    log.info(s"Fetching $mediaType content in section: $sectionId")

    val excludeTags: Seq[String] = (request.queryString.getOrElse("exclude-tag", Nil) ++ seriesId).map(t => s"-$t")
    val tags = (s"type/$mediaType" +: excludeTags).mkString(",")

    def isCurrentStory(content: ApiContent) =
      content.fields.flatMap(_.shortUrl).exists(!_.equals(currentShortUrl))

    val promiseOrResponse = contentApiClient.getResponse(contentApiClient.search(edition)
      .section(sectionId)
      .tag(tags)
      .showTags("all")
      .showFields("all")
    ).map {
      response =>
        response.results.toList filter { content => isCurrentStory(content) } map { result =>
          RelatedContentItem(result)
        } match {
          case Nil => None
          case results => Some(results)
        }
    }

    promiseOrResponse recover { case GuardianContentApiError(404, message, _) =>
      log.info(s"Got a 404 calling content api: $message" )
      None
    }
  }

  private def renderSectionTrails(mediaType: String, trails: Seq[RelatedContentItem], sectionId: String)(implicit request: RequestHeader) = {
    val sectionName = trails.headOption.map(t => t.content.trail.sectionName.toLowerCase).getOrElse("")

    // Content API doesn't understand the alias 'uk-news'.
    val sectionTag = sectionId match {
      case "uk-news" => "uk"
      case _ => sectionId
    }
    val tagCombinedHref = s"$sectionTag/$sectionTag+content/$mediaType"
    val pluralMediaType = mediaType match {
      case "audio" => "audio"
      case m => s"${m}s"
    }

    val dataId = s"$pluralMediaType in section"
    val displayName = Some(s"more $sectionName $pluralMediaType")
    val componentId = Some("more-media-in-section")

    implicit val config = CollectionConfig.empty.copy(href = Some(tagCombinedHref), displayName = displayName)

    val response = () => views.html.fragments.containers.facia_cards.container(
      FaciaContainer(
        1,
        Fixed(FixedContainers.fixedMediumFastXI),
        CollectionConfigWithId(dataId, config),
        CollectionEssentials(trails.take(7).map(_.faciaContent), Nil, displayName, None, None, None),
        componentId
      ).withTimeStamps,
      FrontProperties.empty
    )
    renderFormat(response, response, 900)
  }
}
