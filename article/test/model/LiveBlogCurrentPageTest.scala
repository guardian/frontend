package model

import model.liveblog.BodyBlock.{KeyEvent, SummaryEvent}
import model.liveblog._
import org.joda.time.DateTime
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.Assertion

class LiveBlogCurrentPageTest extends AnyFlatSpec with Matchers {

  def fakeBlock(
      publicationOrder: Int,
      isKeyEvent: Boolean = false,
      isPinnedBlock: Boolean = false,
      isSummaryBlock: Boolean = false,
  ): BodyBlock =
    BodyBlock(
      s"$publicationOrder",
      "",
      "",
      None,
      BlockAttributes(isPinnedBlock, isKeyEvent, isSummaryBlock, None),
      false,
      None,
      firstPublishedDate = Some(new DateTime(publicationOrder)),
      None,
      None,
      Nil,
      Nil,
    )

  private def fakeBlocks(
      number: Int,
      ofWhichKeyEvents: Int = 0,
      ofWhichPinnedBlocks: Int = 0,
      ofWhichSummaries: Int = 0,
  ): List[BodyBlock] = {
    number should be > ofWhichKeyEvents + ofWhichPinnedBlocks + ofWhichSummaries

    val regular =
      Range(number, ofWhichKeyEvents + ofWhichPinnedBlocks + ofWhichSummaries, -1).map(p => fakeBlock(p)).toList

    val keyEvents = Range(
      ofWhichKeyEvents + ofWhichPinnedBlocks + ofWhichSummaries,
      ofWhichPinnedBlocks + ofWhichSummaries,
      -1,
    ).map(p => fakeBlock(p, true, false)).toList

    val pinnedBlocks =
      Range(ofWhichPinnedBlocks + ofWhichSummaries, ofWhichSummaries, -1).map(p => fakeBlock(p, false, true)).toList

    val summaries = Range(ofWhichSummaries, 0, -1).map(p => fakeBlock(p, false, false, true)).toList

    regular ++ keyEvents ++ pinnedBlocks ++ summaries
  }

  "firstPage" should "allow 1 block on one page" in {
    val result = {
      LiveBlogCurrentPage.firstPage(
        2,
        Blocks(1, Nil, None, Map(CanonicalLiveBlog.firstPage -> Seq(fakeBlock(1)))),
      )
    }

    result should be(
      Some(
        LiveBlogCurrentPage(
          currentPage = FirstPage(Seq(fakeBlock(1))),
          pagination = None,
          pinnedBlock = None,
        ),
      ),
    )

  }

  def should(
      result: Option[LiveBlogCurrentPage],
      currentPage: PageReference,
      pagination: Option[N1Pagination],
  ): Assertion = {
    result.get.currentPage should be(currentPage)
    result.get.pagination should be(pagination)
  }

  it should "add the most recent pinned post to the first page" in {
    val blocks = fakeBlocks(5, 0, 3, 0)
    val latestPinnedBlock = fakeBlock(3, false, true).copy(id = "3-pinned")
    val olderPinnedBlock = fakeBlock(2, false, true)
    val evenOlderPinnedBlock = fakeBlock(1, false, true)
    val result = LiveBlogCurrentPage.firstPage(
      2,
      Blocks(
        6,
        Nil,
        None,
        Map(
          CanonicalLiveBlog.firstPage -> blocks.take(3),
          CanonicalLiveBlog.pinned -> blocks.slice(2, 5),
          CanonicalLiveBlog.oldestPage -> blocks.lastOption.toSeq,
        ),
      ),
    )
    result.get.pinnedBlock should be(Some(latestPinnedBlock))
    result.get.pinnedBlock should not be (Some(olderPinnedBlock))
    result.get.pinnedBlock should not be (Some(evenOlderPinnedBlock))
  }

  it should "not add a pinned post as the first standard block" in {
    val firstBlock = fakeBlock(3, false, false)
    val secondBlock = fakeBlock(2, false, true)
    val thirdBlock = fakeBlock(1, false, false)
    val blocks = List(firstBlock, secondBlock, thirdBlock) // blocks list should be ordered based on publication order
    val expectedPinnedBlock = fakeBlock(2, false, true).copy(id = "2-pinned")
    val result = LiveBlogCurrentPage.firstPage(
      2,
      Blocks(
        6,
        Nil,
        None,
        Map(
          CanonicalLiveBlog.firstPage -> blocks.take(3),
          CanonicalLiveBlog.pinned -> blocks.slice(1, 2),
          CanonicalLiveBlog.oldestPage -> blocks.lastOption.toSeq,
        ),
      ),
    )

    result.get.pinnedBlock should be(Some(expectedPinnedBlock))
    result.get.currentPage.blocks.headOption.get.id should not be (expectedPinnedBlock.id)
  }

  it should "allow 3 blocks on one page" in {
    val blocks = fakeBlocks(3)

    val result = LiveBlogCurrentPage.firstPage(
      2,
      Blocks(
        3,
        Nil,
        None,
        Map(CanonicalLiveBlog.firstPage -> blocks.take(4), CanonicalLiveBlog.oldestPage -> blocks.lastOption.toSeq),
      ),
    )

    should(result, FirstPage(blocks), None)
  }

  it should "put 4 blocks on two pages (main page)" in {
    val blocks = fakeBlocks(4)
    val result = LiveBlogCurrentPage.firstPage(
      2,
      Blocks(
        4,
        Nil,
        None,
        Map(CanonicalLiveBlog.firstPage -> blocks.take(4), CanonicalLiveBlog.oldestPage -> blocks.lastOption.toSeq),
      ),
    )

    val expected = blocks.take(2)
    val expectedOldestPage =
      BlockPage(blocks = Nil, blockId = "1", pageNumber = 2)
    val expectedOlderPage =
      BlockPage(blocks = Nil, blockId = "2", pageNumber = 2)
    val expectedPagination = Some(
      N1Pagination(
        newest = None,
        newer = None,
        older = Some(expectedOlderPage),
        oldest = Some(expectedOldestPage),
        numberOfPages = 2,
      ),
    )

    should(result, currentPage = FirstPage(expected), pagination = expectedPagination)
  }

  it should "put 5 blocks on two pages (main page)" in {
    val blocks = fakeBlocks(5)
    val result = LiveBlogCurrentPage.firstPage(
      2,
      Blocks(
        5,
        Nil,
        None,
        Map(CanonicalLiveBlog.firstPage -> blocks.take(4), CanonicalLiveBlog.oldestPage -> blocks.lastOption.toSeq),
      ),
    )

    val expectedCurrentPage = FirstPage(blocks = blocks.take(3))
    val expectedOldestPage =
      BlockPage(blocks = Nil, blockId = "1", pageNumber = 2)
    val expectedOlderPage =
      BlockPage(blocks = Nil, blockId = "2", pageNumber = 2)
    val expectedPagination = Some(
      N1Pagination(
        newest = None,
        newer = None,
        older = Some(expectedOlderPage),
        oldest = Some(expectedOldestPage),
        numberOfPages = 2,
      ),
    )
    should(result, currentPage = expectedCurrentPage, pagination = expectedPagination)
  }

  "findPageWithBlock" should "put 4 blocks on two pages - older page link" in {
    val blocks = fakeBlocks(4)
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "2")

    val expectedCurrentPage =
      BlockPage(
        blocks = blocks.takeRight(2),
        blockId = "2",
        pageNumber = 2,
      )
    val expectedNewestPage = FirstPage(blocks.take(2))
    val expectedPagination = Some(
      N1Pagination(
        newest = Some(expectedNewestPage),
        newer = Some(expectedNewestPage),
        older = None,
        oldest = None,
        numberOfPages = 2,
      ),
    )

    should(result, currentPage = expectedCurrentPage, pagination = expectedPagination)
  }

  it should "put 4 blocks on two pages - link to another block on the page" in {
    val blocks = fakeBlocks(4)
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "1")

    val expectedCurrentPage =
      BlockPage(
        blocks = blocks.takeRight(2),
        blockId = "2",
        pageNumber = 2,
      )
    val expectedNewestPage = FirstPage(blocks.take(2))
    val expectedPagination = Some(
      N1Pagination(
        newest = Some(expectedNewestPage),
        newer = Some(expectedNewestPage),
        older = None,
        oldest = None,
        numberOfPages = 2,
      ),
    )

    should(result, currentPage = expectedCurrentPage, pagination = expectedPagination)
  }

  it should "put 5 blocks on two pages (block 3 from oldest page)" in {
    val blocks = fakeBlocks(5)
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "2")

    val expectedCurrentPage =
      BlockPage(
        blocks = blocks.takeRight(2),
        blockId = "2",
        pageNumber = 2,
      )
    val expectedNewestPage = FirstPage(blocks.take(3))
    val expectedPagination = Some(
      N1Pagination(
        newest = Some(expectedNewestPage),
        newer = Some(expectedNewestPage),
        older = None,
        oldest = None,
        numberOfPages = 2,
      ),
    )

    should(result, currentPage = expectedCurrentPage, pagination = expectedPagination)
  }

  it should "put 6 blocks on 3 pages (main page)" in {
    val blocks = fakeBlocks(6)
    val result = LiveBlogCurrentPage.firstPage(
      2,
      Blocks(
        6,
        Nil,
        None,
        Map(CanonicalLiveBlog.firstPage -> blocks.take(4), CanonicalLiveBlog.oldestPage -> blocks.lastOption.toSeq),
      ),
    )

    val expectedCurrentPage = FirstPage(blocks = blocks.take(2))
    val expectedMiddlePage =
      BlockPage(blocks = Nil, blockId = "4", pageNumber = 2)
    val expectedOldestPage =
      BlockPage(blocks = Nil, blockId = "1", pageNumber = 3)
    val expectedPagination = Some(
      N1Pagination(
        newest = None,
        newer = None,
        older = Some(expectedMiddlePage),
        oldest = Some(expectedOldestPage),
        numberOfPages = 3,
      ),
    )

    should(result, currentPage = expectedCurrentPage, pagination = expectedPagination)
  }

  it should "put 6 blocks on 3 pages (middle page)" in {
    val blocks = fakeBlocks(6)
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "4")

    val expectedCurrentPage =
      BlockPage(
        blocks = blocks.slice(2, 4),
        blockId = "4",
        pageNumber = 2,
      )
    val expectedFirstPage = FirstPage(blocks = blocks.take(2))
    val expectedOlderPage =
      BlockPage(
        blocks = blocks.takeRight(2),
        blockId = "2",
        pageNumber = 3,
      )
    val expectedPagination = Some(
      N1Pagination(
        newest = Some(expectedFirstPage),
        newer = Some(expectedFirstPage),
        older = Some(expectedOlderPage),
        oldest = Some(expectedOlderPage),
        numberOfPages = 3,
      ),
    )

    should(result, currentPage = expectedCurrentPage, pagination = expectedPagination)
  }

  it should "put 6 blocks on 3 pages (oldest page)" in {
    val blocks = fakeBlocks(6)
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "2")

    val expectedCurrentPage =
      BlockPage(
        blocks = blocks.takeRight(2),
        blockId = "2",
        pageNumber = 3,
      )
    val expectedFirstPage = FirstPage(blocks = blocks.take(2))
    val expectedMiddlePage =
      BlockPage(
        blocks = blocks.slice(2, 4),
        blockId = "4",
        pageNumber = 2,
      )
    val expectedPagination = Some(
      N1Pagination(
        newest = Some(expectedFirstPage),
        newer = Some(expectedMiddlePage),
        older = None,
        oldest = None,
        numberOfPages = 3,
      ),
    )

    should(result, currentPage = expectedCurrentPage, pagination = expectedPagination)
  }

  case class TestFakeBlocks(numberOfBlocks: Int, numberOfKeyEventsBlocks: Int, sinceBlockId: Option[String]) {
    val blocksSequence = fakeBlocks(numberOfBlocks, numberOfKeyEventsBlocks).toSeq

    val index = blocksSequence.map(_.id).indexOf(sinceBlockId.getOrElse(""))
    val minIndex = if (index - 2 > -1) index - 2 else 0
    val maxIndex = if (index + 2 < blocksSequence.length) index + 3 else blocksSequence.length
    val blocksType = Blocks(
      blocksSequence.length,
      blocksSequence,
      None,
      Map(
        CanonicalLiveBlog.timeline -> blocksSequence.slice(numberOfBlocks - numberOfKeyEventsBlocks, numberOfBlocks),
        CanonicalLiveBlog.summary -> Seq(),
        s"body:around:${sinceBlockId.getOrElse("")}:5" -> blocksSequence.slice(minIndex, maxIndex),
      ),
    )
  }
}
