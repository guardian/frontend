package model

import model.liveblog.{Blocks, BodyBlock}

case class LiveBlogCurrentPage(
    currentPage: PageReference,
    pagination: Option[N1Pagination],
)

// Extends normal Pages due to the need for pagination and since-last-seen logic on

object LiveBlogCurrentPage {

  def apply(pageSize: Int, blocks: Blocks, range: BlockRange): Option[LiveBlogCurrentPage] = {
    range match {
      case CanonicalLiveBlog               => firstPage(pageSize, blocks)
      case PageWithBlock(isRequestedBlock) => findPageWithBlock(pageSize, blocks.body, isRequestedBlock)
      case SinceBlockId(blockId)           => updates(blocks, SinceBlockId(blockId))
      case ArticleBlocks                   => None
      case GenericFallback                 => None
    }
  }

  // filters newer blocks out of the list
  def updates(blocks: Blocks, sinceBlockId: SinceBlockId): Option[LiveBlogCurrentPage] = {
    val bodyBlocks = blocks.requestedBodyBlocks.get(sinceBlockId.around).toSeq.flatMap { bodyBlocks =>
      bodyBlocks.takeWhile(_.id != sinceBlockId.lastUpdate)
    }
    Some(LiveBlogCurrentPage(FirstPage(bodyBlocks), None)) // just pretend to be the first page, it'll be ignored
  }

  // turns the slimmed down (to save bandwidth) capi response into a first page model object
  def firstPage(pageSize: Int, blocks: Blocks): Option[LiveBlogCurrentPage] = {
    val remainder = blocks.totalBodyBlocks % pageSize
    val numPages = blocks.totalBodyBlocks / pageSize
    blocks.requestedBodyBlocks.get(CanonicalLiveBlog.firstPage).map { requestedBodyBlocks =>
      val (firstPageBlocks, startOfSecondPageBlocks) = requestedBodyBlocks.splitAt(remainder + pageSize)
      val oldestPage = blocks.requestedBodyBlocks
        .get(CanonicalLiveBlog.oldestPage)
        .flatMap(_.headOption.map { block =>
          BlockPage(blocks = Nil, blockId = block.id, pageNumber = numPages)
        })
      val olderPage = startOfSecondPageBlocks.headOption.map { block =>
        BlockPage(blocks = Nil, blockId = block.id, pageNumber = 2)
      }
      val pagination =
        if (blocks.totalBodyBlocks > firstPageBlocks.size)
          Some(
            N1Pagination(
              newest = None,
              newer = None,
              oldest = oldestPage,
              older = olderPage,
              numberOfPages = numPages,
            ),
          )
        else None
      LiveBlogCurrentPage(FirstPage(firstPageBlocks), pagination)
    }
  }

  // turns a full capi blocks list into a page model of the page with a specific block in it
  def findPageWithBlock(
      pageSize: Int,
      blocks: Seq[BodyBlock],
      isRequestedBlock: String,
  ): Option[LiveBlogCurrentPage] = {
    val (mainPageBlocks, restPagesBlocks) = getPages(pageSize, blocks)
    val newestPage = FirstPage(mainPageBlocks)
    val pages = newestPage :: restPagesBlocks.zipWithIndex
      .map {
        case (page, index) =>
          // page number is index + 2 to account for first page and 0 based index
          BlockPage(blocks = page, blockId = page.head.id, pageNumber = index + 2)
      }
    val oldestPage = pages.lastOption.getOrElse(newestPage)

    val endedPages = None :: (pages.map(Some.apply) :+ None)

    def hasRequestedBlock(page: LiveBlogCurrentPage): Boolean = {
      page.currentPage.blocks.exists(_.id == isRequestedBlock)
    }

    endedPages
      .sliding(3)
      .toList
      .zipWithIndex
      .map {
        case (List(newerPage, Some(currentPage), olderPage), index) =>
          val isNewestPage = newestPage.equals(currentPage)
          LiveBlogCurrentPage(
            currentPage = currentPage,
            pagination =
              if (pages.length > 1)
                Some(
                  N1Pagination(
                    newest = if (isNewestPage) None else Some(newestPage),
                    newer = newerPage,
                    oldest = if (oldestPage.equals(currentPage)) None else Some(oldestPage),
                    older = olderPage,
                    numberOfPages = pages.length,
                  ),
                )
              else None,
          )
      }
      .find(hasRequestedBlock)
  }

  // returns the pages, newest at the end, newest at the start
  def getPages[B](pageSize: Int, blocks: Seq[B]): (Seq[B], List[Seq[B]]) = {
    val length = blocks.size
    val remainder = length % pageSize
    val (main, rest) = blocks.splitAt(remainder + pageSize)
    (main, rest.grouped(pageSize).toList)
  }

}

sealed trait PageReference {
  def blocks: Seq[BodyBlock]
  def suffix: String
  def pageNumber: Int
  def isArchivePage: Boolean
}

case class N1Pagination(
    newest: Option[PageReference],
    newer: Option[PageReference],
    oldest: Option[PageReference],
    older: Option[PageReference],
    numberOfPages: Int,
)

case class FirstPage(blocks: Seq[BodyBlock]) extends PageReference {
  val suffix = ""
  val pageNumber = 1
  val isArchivePage = false
}
case class BlockPage(blocks: Seq[BodyBlock], blockId: String, pageNumber: Int) extends PageReference {
  val suffix = s"?page=with:block-$blockId"
  val isArchivePage = true
}

object LatestBlock {
  def apply(maybeBlocks: Option[Blocks]): Option[String] = {
    maybeBlocks.flatMap { blocks =>
      blocks.requestedBodyBlocks.getOrElse(CanonicalLiveBlog.firstPage, blocks.body).headOption.map(_.id)
    }
  }
}
