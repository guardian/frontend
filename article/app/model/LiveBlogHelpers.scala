package model

import com.gu.contentapi.client.model.v1.ItemResponse
import common.GuLogging
import common.`package`._
import model.liveblog.BodyBlock
import model.ParseBlockId.ParsedBlockId
import org.joda.time.DateTime
import play.api.libs.functional.syntax._
import play.api.libs.json.{JsValue, Json, _}

object LiveBlogHelpers extends GuLogging {

  // Get a Seq[BodyBlock] given an article and the "page" request parameter on live-blog pages.

  def blocksForLiveBlogRequest(
      article: Article,
      param: Option[String],
      filterKeyEvents: Boolean,
  ): Seq[BodyBlock] = {

    def modelWithRange(range: BlockRange) =
      LiveBlogHelpers.createLiveBlogModel(article, range, filterKeyEvents)

    val lbcp = param.map(ParseBlockId.fromPageParam) match {
      case Some(ParsedBlockId(id)) => modelWithRange(PageWithBlock(id))
      case _                       => modelWithRange(CanonicalLiveBlog)
    }

    lbcp match {
      case Some(blog) => blog.currentPage.blocks
      case None       => Seq()
    }

  }

  // Given a BlockRange and an article, return a combined LiveBlogCurrentPage instance

  def createLiveBlogModel(
      liveBlog: Article,
      range: BlockRange,
      filterKeyEvents: Boolean,
  ): Option[LiveBlogCurrentPage] = {

    val pageSize = if (liveBlog.content.tags.tags.map(_.id).contains("sport/sport")) 30 else 10

    val page = liveBlog.content.fields.blocks.map(
      LiveBlogCurrentPage(
        pageSize = pageSize,
        _,
        range,
        filterKeyEvents,
      ),
    )

    page getOrElse None

  }

  def createLiveBlogModel(
      liveBlog: Article,
      response: ItemResponse,
      range: BlockRange,
      filterKeyEvents: Boolean,
  ): Either[Status, LiveBlogPage] = {

    val pageSize = if (liveBlog.content.tags.tags.map(_.id).contains("sport/sport")) 30 else 10

    val liveBlogPageModel: Option[LiveBlogCurrentPage] =
      liveBlog.content.fields.blocks.flatMap { blocks =>
        LiveBlogCurrentPage(
          pageSize = pageSize,
          blocks,
          range,
          filterKeyEvents,
        )
      }

    liveBlogPageModel
      .map { pageModel =>
        val isTransient = range match {
          case SinceBlockId(_) =>
            pageModel.currentPage.blocks.isEmpty
          case _ =>
            !pageModel.currentPage.isArchivePage
        }

        val cacheTime =
          if (isTransient && liveBlog.fields.isLive)
            liveBlog.metadata.cacheTime
          else
            CacheTime.NotRecentlyUpdated

        val liveBlogCache = liveBlog.copy(
          content = liveBlog.content.copy(metadata = liveBlog.content.metadata.copy(cacheTime = cacheTime)),
        )

        Right(
          LiveBlogPage(
            article = liveBlogCache,
            currentPage = pageModel,
            related = StoryPackages(liveBlog.metadata.id, response),
            filterKeyEvents = filterKeyEvents,
            pageModel.currentPage.blocks,
          ),
        )
      }
      .getOrElse(Left(NotFound))

  }

  def blockTextJson(page: LiveBlogPage, number: Int): JsValue = {

    case class TextBlock(
        id: String,
        title: Option[String],
        publishedDateTime: Option[DateTime],
        lastUpdatedDateTime: Option[DateTime],
        body: String,
    )

    implicit val dateToTimestampWrites = play.api.libs.json.JodaWrites.JodaDateTimeNumberWrites

    implicit val blockWrites = (
      (__ \ "id").write[String] ~
        (__ \ "title").write[Option[String]] ~
        (__ \ "publishedDateTime").write[Option[DateTime]] ~
        (__ \ "lastUpdatedDateTime").write[Option[DateTime]] ~
        (__ \ "body").write[String]
    )(unlift(TextBlock.unapply))

    val firstPageBlocks = for {
      blocks <- page.article.blocks.toSeq
      firstPageBlocks <- blocks.requestedBodyBlocks.get(CanonicalLiveBlog.firstPage).toSeq
      firstPageBlock <- firstPageBlocks
    } yield firstPageBlock

    val textBlocks = firstPageBlocks
      .take(number)
      .collect {
        case BodyBlock(id, html, summary, title, _, _, _, publishedAt, _, updatedAt, _, _) if html.trim.nonEmpty =>
          TextBlock(id, title, publishedAt, updatedAt, summary)
      }

    Json.toJson(textBlocks)

  }

}
