package services

import common.{Edition, GuLogging}
import conf.switches.Switches.RelatedContentSwitch
import contentapi.ContentApiClient
import model.dotcomrendering.{OnwardCollectionResponse, Trail}
import play.api.mvc.RequestHeader

import scala.concurrent.{ExecutionContext, Future}
case class RelatedContentDisabledException() extends Exception
case class NoRelatedContentException() extends Exception
class RelatedContentService(contentApiClient: ContentApiClient)(implicit
    executionContext: ExecutionContext,
) extends GuLogging {
  def fetch(edition: Edition, pageId: String, excludeTags: Seq[String])(implicit
      requestHeader: RequestHeader,
  ): Future[OnwardCollectionResponse] = {
    if (RelatedContentSwitch.isSwitchedOff) {
      logWarningWithCustomFields(
        "Failed getting related content due to RelatedContentSwitch being off",
        RelatedContentDisabledException(),
        List("pageId" -> pageId),
      )
      return Future.failed(RelatedContentDisabledException())
    }

    // doesn't like "tag" being an empty string - need to explicitly pass a None
    val tags: Option[String] = excludeTags.toList match {
      case Nil       => None
      case excluding => Some(excluding.map(t => s"-$t").mkString(","))
    }

    val response = contentApiClient.getResponse(
      contentApiClient
        .item(pageId, edition)
        .tag(tags)
        .showRelated(true),
    )

    val trails = response.map(
      _.relatedContent
        .getOrElse(Seq())
        .sortBy(-_.webPublicationDate.get.dateTime)
        .map(FaciaContentConvert.contentToFaciaContent)
        .map(Trail.pressedContentToTrail),
    )

    trails
      .map(trails => if (trails.isEmpty) throw NoRelatedContentException() else trails)
      .map(trails =>
        OnwardCollectionResponse(
          heading = "Related content",
          trails = trails.take(10),
        ),
      )
  }
}
