package services

import com.gu.contentapi.client.utils.format.{ArticleDesign, NewsPillar, StandardDisplay}
import common.Edition
import contentapi.ContentApiClient
import feed.MostReadAgent
import layout.ContentCard
import model.ContentFormat
import model.dotcomrendering.{OnwardCollectionResponse, Trail}

import scala.concurrent.{ExecutionContext, Future}

trait GetPopularInTagDCR {

  val contentApiClient: ContentApiClient
  implicit val executionContext: ExecutionContext

  def mostReadAgent: MostReadAgent

  def getPopularInTagTrails(
      edition: Edition,
      tag: String,
      excludeTags: Seq[String] = Nil,
  ): Future[OnwardCollectionResponse] = {

    val tags = (tag +: excludeTags.map(t => s"-$t")).mkString(",")

    val response = contentApiClient.getResponse(
      contentApiClient
        .search(edition)
        .tag(tags)
        .pageSize(50),
    )

    val trails: Future[OnwardCollectionResponse] = response.map { response =>
      val items = response.results.flatMap { item =>
        for {
          contentCard <- ContentCard.fromApiContent(item)
          trail <- Trail.contentCardToTrail(contentCard)
        } yield trail
      }
      OnwardCollectionResponse(
        // todo: not sure if this is the right heading, but it seems to be the one we're currently using
        heading = "Related content",
        trails = items.sortBy(trail => -mostReadAgent.getViewCount(trail.url).getOrElse(0)).take(10).toSeq,
        // todo: find a good pattern for passing format data from the client (what format data does DCR actually *need*?)
        format = ContentFormat(design = ArticleDesign, theme = NewsPillar, display = StandardDisplay),
        onwardsSource = "popular-in-tag",
      )
    }

    trails
  }
}
