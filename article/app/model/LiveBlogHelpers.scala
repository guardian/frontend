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
      LiveBlogHelpers.createLiveBlogModel(article, range, filterKeyEvents, None)

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
      topMentionResult: Option[TopMentionsResult],
  ): Option[LiveBlogCurrentPage] = {

    val pageSize = if (liveBlog.content.tags.tags.map(_.id).contains("sport/sport")) 30 else 10

    val page = liveBlog.content.fields.blocks.map(
      LiveBlogCurrentPage(
        pageSize = pageSize,
        _,
        range,
        filterKeyEvents,
        topMentionResult,
      ),
    )

    page getOrElse None

  }

  def printCurrentPage(page: Option[LiveBlogCurrentPage]) = {
    val stringBuilder = StringBuilder.newBuilder
    if (page.isDefined) {
      stringBuilder.append("current pages: \n")

      page.get.currentPage.blocks.foreach(block => stringBuilder.append(s"block: ${block.id} \n"))

      if (page.get.pagination.isDefined) {

        val older = page.get.pagination.get.older
        val oldest = page.get.pagination.get.oldest
        val newer = page.get.pagination.get.newer
        val newest = page.get.pagination.get.newest

        if (older.isDefined) {
          stringBuilder.append(s"older pages: length: ${older.get.blocks.length} \n")
          older.get match {
            case BlockPage(_, blockId, _, _) => stringBuilder.append(s"block id: ${blockId} \n")
            case _                           => older.get.blocks.foreach(block => stringBuilder.append(s"block: ${block.id} \n"))
          }

        } else stringBuilder.append("older pages: None \n")

        if (oldest.isDefined) {
          stringBuilder.append(s"oldest pages: length: ${oldest.get.blocks.length} \n")
          oldest.get match {
            case BlockPage(_, blockId, _, _) => stringBuilder.append(s"block id: ${blockId} \n")
            case _                           => oldest.get.blocks.foreach(block => stringBuilder.append(s"block: ${block.id} \n"))
          }
        } else stringBuilder.append("oldest pages: None \n")

        if (newer.isDefined) {
          stringBuilder.append(s"newer pages: length: ${newer.get.blocks.length} \n")

          newer.get match {
            case BlockPage(_, blockId, _, _) => stringBuilder.append(s"block id: ${blockId} \n")
            case _                           => newer.get.blocks.foreach(block => stringBuilder.append(s"block: ${block.id} \n"))
          }
        } else stringBuilder.append("newer pages: None \n")

        if (newest.isDefined) {
          stringBuilder.append(s"newest pages: length: ${newest.get.blocks.length} \n")
          newest.get match {
            case BlockPage(_, blockId, _, _) => stringBuilder.append(s"block id: ${blockId} \n")
            case _                           => newest.get.blocks.foreach(block => stringBuilder.append(s"block: ${block.id} \n"))
          }
        } else stringBuilder.append("newest pages: None \n")
      } else stringBuilder.append("pagination pages: None \n")
    }

    log.info(stringBuilder.toString())
  }

  def createLiveBlogModel(
      liveBlog: Article,
      response: ItemResponse,
      range: BlockRange,
      filterKeyEvents: Boolean,
      topMentionResult: Option[TopMentionsResult],
  ): Either[LiveBlogPage, Status] = {

    val pageSize = if (liveBlog.content.tags.tags.map(_.id).contains("sport/sport")) 30 else 10

    val liveBlogPageModel: Option[LiveBlogCurrentPage] =
      liveBlog.content.fields.blocks.map { blocks =>
        LiveBlogCurrentPage(
          pageSize = pageSize,
          blocks,
          range,
          filterKeyEvents,
          topMentionResult,
        )
      } getOrElse None

    if (topMentionResult.isDefined) log.info(s"topMentionResult count: ${topMentionResult.get.count}")
    printCurrentPage(liveBlogPageModel)

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

        Left(
          LiveBlogPage(
            article = liveBlogCache,
            currentPage = pageModel,
            related = StoryPackages(liveBlog.metadata.id, response),
            filterKeyEvents = filterKeyEvents,
          ),
        )
      }
      .getOrElse(Right(NotFound))

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
