package model

import model.liveblog.BodyBlock.{KeyEvent, SummaryEvent}
import model.liveblog.{Blocks, BodyBlock}

case class LiveBlogCurrentPage(
    currentPage: PageReference,
    pagination: Option[N1Pagination],
    pinnedBlock: Option[BodyBlock],
)

// Extends normal Pages due to the need for pagination and since-last-seen logic on

object LiveBlogCurrentPage {

  def apply(
      pageSize: Int,
      blocks: Blocks,
      range: BlockRange,
  ): Option[LiveBlogCurrentPage] = {
    range match {
      case CanonicalLiveBlog               => firstPage(pageSize, blocks)
      case PageWithBlock(isRequestedBlock) =>
        findPageWithBlock(pageSize, blocks.body, isRequestedBlock)
      case SinceBlockId(blockId) => updates(blocks, SinceBlockId(blockId))
      case ArticleBlocks         => None
      case GenericFallback       => None
      case _                     => None
    }
  }

  // filters newer blocks out of the list
  def updates(
      blocks: Blocks,
      sinceBlockId: SinceBlockId,
  ): Option[LiveBlogCurrentPage] = {

    val bodyBlocks = blocks.requestedBodyBlocks.get(sinceBlockId.around).toSeq.flatMap { bodyBlocks =>
      bodyBlocks.takeWhile(_.id != sinceBlockId.lastUpdate)
    }
    Some(
      LiveBlogCurrentPage(FirstPage(bodyBlocks), None, None),
    ) // just pretend to be the first page, it'll be ignored
  }

  // turns the slimmed down (to save bandwidth) capi response into a first page model object
  def firstPage(
      pageSize: Int,
      blocks: Blocks,
  ): Option[LiveBlogCurrentPage] = {
    val (maybeRequestedBodyBlocks, blockCount, oldestPageBlockId) = getStandardBlocks(blocks)
    val remainder = blockCount % pageSize
    val numPages = blockCount / pageSize

    maybeRequestedBodyBlocks.map { requestedBodyBlocks =>
      val (firstPageBlocks, startOfSecondPageBlocks) = requestedBodyBlocks.splitAt(remainder + pageSize)

      val olderPage = startOfSecondPageBlocks.headOption.map { block =>
        BlockPage(blocks = Nil, blockId = block.id, pageNumber = 2)
      }

      val oldestPage = oldestPageBlockId map { blockId =>
        BlockPage(blocks = Nil, blockId = blockId, pageNumber = numPages)
      }

      val pinnedBlocks = blocks.requestedBodyBlocks.get(CanonicalLiveBlog.pinned)
      val pinnedBlock = pinnedBlocks.flatMap(_.headOption)
      val blocksToDisplay = removeFirstBlockIfPinned(firstPageBlocks, pinnedBlock)
      val pinnedBlockRenamed = pinnedBlock.map(renamePinnedBlock)

      val pagination = {
        if (blockCount > firstPageBlocks.size)
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
      }
      LiveBlogCurrentPage(FirstPage(blocksToDisplay), pagination, pinnedBlockRenamed)
    }
  }

  private def getStandardBlocks(blocks: Blocks): (Option[Seq[BodyBlock]], Int, Option[String]) = {
    val firstPageBlocks = blocks.requestedBodyBlocks.get(CanonicalLiveBlog.firstPage)
    val oldestPageBlockId =
      blocks.requestedBodyBlocks.get(CanonicalLiveBlog.oldestPage) flatMap (_.headOption.map(_.id))

    (firstPageBlocks, blocks.totalBodyBlocks, oldestPageBlockId)
  }

  private def removeFirstBlockIfPinned(firstPageBlocks: Seq[BodyBlock], pinnedBlock: Option[BodyBlock]) = {
    firstPageBlocks match {
      case firstBlock +: otherBlocks if pinnedBlock.contains(firstBlock) => otherBlocks
      case _                                                             => firstPageBlocks
    }
  }

  // turns a full capi blocks list into a page model of the page with a specific block in it
  def findPageWithBlock(
      pageSize: Int,
      blocks: Seq[BodyBlock],
      requestedBlockId: String,
  ): Option[LiveBlogCurrentPage] = {
    val pages: Seq[PageReference] = pagesFromBodyBlocks(pageSize, blocks)

    val indexOfPageWithRequestedBlock = pages.indexWhere(_.blocks.exists(_.id == requestedBlockId))
    if (indexOfPageWithRequestedBlock < 0) None
    else
      Some {
        val currentPage = pages(indexOfPageWithRequestedBlock)
        val isNewestPage = pages.head == currentPage

        LiveBlogCurrentPage(
          currentPage = currentPage,
          pagination =
            if (pages.size <= 1) None
            else
              Some(
                N1Pagination(
                  newest = if (isNewestPage) None else Some(pages.head),
                  newer = pages.lift(indexOfPageWithRequestedBlock - 1),
                  oldest = if (pages.last == currentPage) None else Some(pages.last),
                  older = pages.lift(indexOfPageWithRequestedBlock + 1),
                  numberOfPages = pages.size,
                ),
              ),
          pinnedBlock = if (isNewestPage) blocks.find(_.attributes.pinned).map(renamePinnedBlock) else None,
        )
      }
  }

  private def pagesFromBodyBlocks(
      pageSize: Int,
      blocks: Seq[BodyBlock],
  ): Seq[PageReference] = {
    val (mainPageBlocks, restPagesBlocks) = getPages(pageSize, blocks)
    FirstPage(mainPageBlocks) :: restPagesBlocks.zipWithIndex.map { case (page, index) =>
      // page number is index + 2 to account for first page and 0-based index of `zipWithIndex`
      BlockPage(blocks = page, blockId = page.head.id, pageNumber = index + 2)
    }
  }

  private def renamePinnedBlock(pinnedBlock: BodyBlock): BodyBlock = {
    pinnedBlock.copy(id = s"${pinnedBlock.id}-pinned")
  }

  // returns the pages, newest at the end, newest at the start
  private def getPages[B](pageSize: Int, blocks: Seq[B]): (Seq[B], List[Seq[B]]) = {
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
  val suffix = s""
  val pageNumber = 1
  val isArchivePage = false
}

case class BlockPage(
    blocks: Seq[BodyBlock],
    blockId: String,
    pageNumber: Int,
) extends PageReference {
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

object LatestKeyBlock {
  def apply(maybeBlocks: Option[Blocks]): Option[String] = {
    maybeBlocks.flatMap { blocks =>
      blocks.requestedBodyBlocks
        .getOrElse(CanonicalLiveBlog.firstPage, blocks.body)
        .find(block => block.eventType == KeyEvent || block.eventType == SummaryEvent)
        .map(_.id)
    }
  }
}
