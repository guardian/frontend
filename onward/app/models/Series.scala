package models

import com.gu.facia.client.models.Backfill
import controllers.visuallyPleasingContainerForStories
import layout.slices.Fixed
import play.api.mvc.RequestHeader
import play.api.libs.json._
import model.{FrontProperties, RelatedContent, Tag}
import layout.{CollectionEssentials, DescriptionMetaHeader, FaciaContainer}
import model.pressed.CollectionConfig
import services.CollectionConfigWithId
import model.dotcomrendering.Trail

case class Series(id: String, tag: Tag, trails: RelatedContent) {
  lazy val displayName = tag.id match {
    case "commentisfree/commentisfree" => "opinion"
    case _                             => tag.metadata.webTitle
  }
}

case class SeriesStoriesDCR(
    id: String,
    displayname: String,
    description: Option[String],
    url: String,
    trails: Seq[Trail],
)

object SeriesStoriesDCR {
  implicit val seriesStoriesDCRWrites = Json.writes[SeriesStoriesDCR]
  def fromSeries(series: Series)(implicit request: RequestHeader): SeriesStoriesDCR = {
    SeriesStoriesDCR(
      id = series.id,
      displayname = series.displayName,
      description = series.tag.properties.description,
      url = series.tag.properties.webUrl,
      trails = series.trails.faciaItems.map(Trail.pressedContentToTrail).take(10),
    )
  }
}

object SeriesHelper {
  def dataForContainerRendering(series: Series): (FaciaContainer, FrontProperties) = {
    /*
        This function was introduced to encapsulate the work originally done in SeriesController's
        renderSeriesTrails function. We want to use the same logic for the DCR version.
     */
    val dataId = "series"
    val componentId = Some("series")
    val displayName = Some(series.displayName)

    val header = series.tag.metadata.description map { description => DescriptionMetaHeader(description) }

    val config = CollectionConfig.empty.copy(
      backfill = Some(Backfill(`type` = "capi", query = series.id)),
      displayName = displayName,
      href = Some(series.id),
    )

    val containerDefinition = FaciaContainer
      .fromConfigWithId(
        index = 1,
        container = Fixed(visuallyPleasingContainerForStories(math.min(series.trails.faciaItems.length, 4))),
        config = CollectionConfigWithId(dataId, config),
        collectionEssentials =
          CollectionEssentials(series.trails.faciaItems take 4, Nil, displayName, None, None, None),
        hasMore = false,
        componentId = componentId,
      )
      .withTimeStamps
      .copy(customHeader = header)

    val frontProperties = FrontProperties.empty.copy(onPageDescription = series.tag.metadata.description)

    (containerDefinition, frontProperties)
  }
}
