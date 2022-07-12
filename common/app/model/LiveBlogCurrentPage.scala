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
      filterKeyEvents: Boolean,
      topicResult: Option[TopicResult],
  ): Option[LiveBlogCurrentPage] = {
    range match {
      case CanonicalLiveBlog | TopicsLiveBlog => firstPage(pageSize, blocks, filterKeyEvents, topicResult)
      case PageWithBlock(isRequestedBlock) =>
        findPageWithBlock(pageSize, blocks.body, isRequestedBlock, filterKeyEvents, topicResult)
      case SinceBlockId(blockId) => updates(blocks, SinceBlockId(blockId), filterKeyEvents, topicResult)
      case ArticleBlocks         => None
      case GenericFallback       => None
      case _                     => None
    }
  }

  // filters newer blocks out of the list
  def updates(
      blocks: Blocks,
      sinceBlockId: SinceBlockId,
      filterKeyEvents: Boolean,
      topicResult: Option[TopicResult],
  ): Option[LiveBlogCurrentPage] = {

    val bodyBlocks = blocks.requestedBodyBlocks.get(sinceBlockId.around).toSeq.flatMap { bodyBlocks =>
      val onlyBlocksAfterLastUpdated = bodyBlocks.takeWhile(_.id != sinceBlockId.lastUpdate)
      applyFilters(onlyBlocksAfterLastUpdated, filterKeyEvents, topicResult)
    }
    Some(
      LiveBlogCurrentPage(FirstPage(bodyBlocks, filterKeyEvents, topicResult), None, None),
    ) // just pretend to be the first page, it'll be ignored
  }

  // turns the slimmed down (to save bandwidth) capi response into a first page model object
  def firstPage(
      pageSize: Int,
      blocks: Blocks,
      filterKeyEvents: Boolean,
      topicResult: Option[TopicResult],
  ): Option[LiveBlogCurrentPage] = {
    val (maybeRequestedBodyBlocks, blockCount, oldestPageBlockId) =
      extractFirstPageBlocks(blocks, filterKeyEvents, topicResult)

    val remainder = blockCount % pageSize
    val numPages = blockCount / pageSize

    maybeRequestedBodyBlocks.map { requestedBodyBlocks =>
      val (firstPageBlocks, startOfSecondPageBlocks) = requestedBodyBlocks.splitAt(remainder + pageSize)

      val olderPage = startOfSecondPageBlocks.headOption.map { block =>
        BlockPage(blocks = Nil, blockId = block.id, pageNumber = 2, filterKeyEvents, topicResult)
      }

      val oldestPage = oldestPageBlockId map { blockId =>
        BlockPage(blocks = Nil, blockId = blockId, pageNumber = numPages, filterKeyEvents, topicResult)
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

      LiveBlogCurrentPage(FirstPage(blocksToDisplay, filterKeyEvents, topicResult), pagination, pinnedBlockRenamed)
    }
  }

  private def extractFirstPageBlocks(
      blocks: Blocks,
      filterKeyEvents: Boolean,
      topicResult: Option[TopicResult],
  ) = {
    if (filterKeyEvents) {
      getKeyEventsBlocks(blocks)
    } else if (topicResult.isDefined) {
      getTopicBlocks(blocks, topicResult.get)
    } else {
      getStandardBlocks(blocks)
    }
  }

  private def isTopicBlock(topic: TopicResult)(bodyBlock: BodyBlock): Boolean = {
    topic.blocks.contains(bodyBlock.id)
  }

  private def filterBlocksByTopic(blocks: Seq[BodyBlock], topic: TopicResult) = {
    blocks.filter(isTopicBlock(topic)).sortBy(_.publishedCreatedTimestamp).reverse
  }

  private def getTopicBlocks(
      blocks: Blocks,
      topic: TopicResult,
  ): (Option[Seq[BodyBlock]], Int, Option[String]) = {
    val bodyBlocks = blocks.body

    val filteredBodyBlocks = filterBlocksByTopic(bodyBlocks, topic)

    (Some(filteredBodyBlocks), filteredBodyBlocks.length, filteredBodyBlocks.lastOption.map(_.id))
  }

  private def getStandardBlocks(blocks: Blocks): (Option[Seq[BodyBlock]], Int, Option[String]) = {
    val firstPageBlocks = blocks.requestedBodyBlocks.get(CanonicalLiveBlog.firstPage)
    val oldestPageBlockId =
      blocks.requestedBodyBlocks.get(CanonicalLiveBlog.oldestPage) flatMap (_.headOption.map(_.id))

    (firstPageBlocks, blocks.totalBodyBlocks, oldestPageBlockId)
  }

  private def getKeyEventsBlocks(blocks: Blocks) = {
    val keyEventsAndSummaries = for {
      keyEvents <- blocks.requestedBodyBlocks.get(CanonicalLiveBlog.timeline)
      summaries <- blocks.requestedBodyBlocks.get(CanonicalLiveBlog.summary)
    } yield {
      (keyEvents ++ summaries).sortBy(_.publishedCreatedTimestamp).reverse
    }

    val keyEventsAndSummariesCount = keyEventsAndSummaries.getOrElse(Seq.empty).size

    val oldestPageBlockId = keyEventsAndSummaries.flatMap(_.lastOption map (_.id))

    (keyEventsAndSummaries, keyEventsAndSummariesCount, oldestPageBlockId)
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
      isRequestedBlock: String,
      filterKeyEvents: Boolean,
      topicResult: Option[TopicResult],
  ): Option[LiveBlogCurrentPage] = {
    val pinnedBlock = blocks.find(_.attributes.pinned).map(renamePinnedBlock)
    val filteredBlocks = applyFilters(blocks, filterKeyEvents, topicResult)
    val (mainPageBlocks, restPagesBlocks) = getPages(pageSize, filteredBlocks)
    val newestPage = FirstPage(mainPageBlocks, filterKeyEvents, topicResult)
    val pages = newestPage :: restPagesBlocks.zipWithIndex
      .map {
        case (page, index) =>
          // page number is index + 2 to account for first page and 0 based index
          BlockPage(blocks = page, blockId = page.head.id, pageNumber = index + 2, filterKeyEvents, topicResult)
      }
    val oldestPage = pages.lastOption.getOrElse(newestPage)

    val endedPages = None :: (pages.map(Some.apply) :+ None)

    def hasRequestedBlock(page: LiveBlogCurrentPage): Boolean = {
      page.currentPage.blocks.exists(_.id == isRequestedBlock)
    }

    endedPages
      .sliding(3)
      .toList
      .map {
        case List(newerPage, Some(currentPage), olderPage) =>
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
            if (isNewestPage) pinnedBlock else None,
          )
      }
      .find(hasRequestedBlock)
  }

  private def renamePinnedBlock(pinnedBlock: BodyBlock): BodyBlock = {
    pinnedBlock.copy(id = s"${pinnedBlock.id}-pinned")
  }

  private def applyFilters(
      blocks: Seq[BodyBlock],
      filterKeyEvents: Boolean,
      topicResult: Option[TopicResult],
  ) = {
    if (filterKeyEvents) {
      blocks.filter(block => block.eventType == KeyEvent || block.eventType == SummaryEvent)
    } else if (topicResult.isDefined) {
      filterBlocksByTopic(blocks, topicResult.get)
    } else {
      blocks
    }
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

  def buildQueryParam(topicResult: Option[TopicResult]) = {
    topicResult match {
      case Some(value) => s"&topics=${value.`type`}:${value.name}"
      case None        => ""
    }
  }
}

case class N1Pagination(
    newest: Option[PageReference],
    newer: Option[PageReference],
    oldest: Option[PageReference],
    older: Option[PageReference],
    numberOfPages: Int,
)

case class FirstPage(blocks: Seq[BodyBlock], filterKeyEvents: Boolean, topicResult: Option[TopicResult])
    extends PageReference {
  val suffix = s"?filterKeyEvents=$filterKeyEvents${buildQueryParam(topicResult)}"
  val pageNumber = 1
  val isArchivePage = false
}

case class BlockPage(
    blocks: Seq[BodyBlock],
    blockId: String,
    pageNumber: Int,
    filterKeyEvents: Boolean,
    topicResult: Option[TopicResult],
) extends PageReference {
  val suffix = s"?page=with:block-$blockId&filterKeyEvents=$filterKeyEvents${buildQueryParam(topicResult)}"
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
