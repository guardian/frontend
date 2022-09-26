package services

import common.Edition
import contentapi.ContentApiClient
import model.RelatedContentItem
import model.dotcomrendering.{OnwardCollectionResponse, Trail}
import play.api.mvc.RequestHeader

import scala.concurrent.{ExecutionContext, Future}

class PopularInTagService(contentApiClient: ContentApiClient)(implicit
    executionContext: ExecutionContext,
) {
  // `itemViewCounts` is a Map[Content.id: String, ViewCount:Int]
  // this is generally fetched from Ophan view the MostPopularAgent, but can come from anywhere
  // and makes this easy to test
  def fetch(edition: Edition, tag: String, excludeTags: Seq[String], itemViewCounts: Map[String, Int])(implicit
      request: RequestHeader,
  ): Future[OnwardCollectionResponse] = {
    val tags = (tag +: excludeTags.map(t => s"-$t")).mkString(",")

    val response = contentApiClient.getResponse(
      contentApiClient
        .search(edition)
        .tag(tags)
        .pageSize(50),
    )

    response.map { response =>
      val numberOfCards = if (response.results.length == 5 || response.results.length == 6) 4 else 8
      val items = response.results.sortBy(content => -itemViewCounts.getOrElse(content.id, 0)).map { item =>
        RelatedContentItem(item)
      }

      OnwardCollectionResponse(
        heading = "Related content",
        trails = items.map(_.faciaContent).map(Trail.pressedContentToTrail).take(numberOfCards).toSeq,
      )
    }
  }
}
