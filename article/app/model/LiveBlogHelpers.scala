package model

import com.gu.contentapi.client.model.v1.ItemResponse
import common.`package`._
import model.liveblog.BodyBlock
import model.ParseBlockId.ParsedBlockId

object LiveBlogHelpers {

  // Get a Seq[BodyBlock] given an article and the "page" request parameter on live-blog pages.

  def blocksForLiveBlogRequest(article: Article, param: Option[String]): Seq[BodyBlock] = {

    def modelWithRange(range: BlockRange) =
      LiveBlogHelpers.createLiveBlogModel(article, range)

    val lbcp = param.map(ParseBlockId.fromPageParam) match {
      case Some(ParsedBlockId(id)) => modelWithRange(PageWithBlock(id))
      case _ => modelWithRange(Canonical)
    }

    lbcp match {
      case Some(blog) => blog.currentPage.blocks
      case None => Seq()
    }

  }

  // Given a BlockRange and an article, return a combined LiveBlogCurrentPage instance

  def createLiveBlogModel(liveBlog: Article, range: BlockRange): Option[LiveBlogCurrentPage] = {

    val pageSize = if (liveBlog.content.tags.tags.map(_.id).contains("sport/sport")) 30 else 10

    val page = liveBlog.content.fields.blocks.map(
      LiveBlogCurrentPage(
        pageSize = pageSize,
        _,
        range
      ))

    page getOrElse None

  }

  def createLiveBlogModel(liveBlog: Article, response: ItemResponse, range: BlockRange) = {

    val pageSize = if (liveBlog.content.tags.tags.map(_.id).contains("sport/sport")) 30 else 10

    val liveBlogPageModel =
      liveBlog.content.fields.blocks.map { blocks =>
        LiveBlogCurrentPage(
          pageSize = pageSize,
          blocks,
          range
        )
      } getOrElse None

    liveBlogPageModel.map { pageModel =>

      val isTransient = range match {
        case SinceBlockId(_) =>
          pageModel.currentPage.blocks.isEmpty
        case _ =>
          !pageModel.currentPage.isArchivePage
      }

      val cacheTime = if (isTransient && liveBlog.fields.isLive)
        liveBlog.metadata.cacheTime
      else
        CacheTime.NotRecentlyUpdated

      val liveBlogCache = liveBlog.copy(
        content = liveBlog.content.copy(
          metadata = liveBlog.content.metadata.copy(
            cacheTime = cacheTime)))
      Left(LiveBlogPage(liveBlogCache, pageModel, StoryPackages(liveBlog, response)))

    }.getOrElse(Right(NotFound))

  }
}
