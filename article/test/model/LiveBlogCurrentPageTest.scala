package model

import model.liveblog.BodyBlock.KeyEvent
import model.liveblog._
import org.joda.time.DateTime
import org.scalatest.{Assertion, FlatSpec, Matchers}

class LiveBlogCurrentPageTest extends FlatSpec with Matchers {

  def fakeBlock(publicationOrder: Int, isKeyEvent: Boolean = false): BodyBlock =
    BodyBlock(
      s"$publicationOrder",
      "",
      "",
      None,
      BlockAttributes(isKeyEvent, false, None),
      false,
      None,
      firstPublishedDate = Some(new DateTime(publicationOrder)),
      None,
      None,
      Nil,
      Nil,
    )

  private def fakeBlocks(number: Int, ofWhichKeyEvents: Int = 0): List[BodyBlock] = {
    number should be > ofWhichKeyEvents
    val regular = Range(number, ofWhichKeyEvents, -1).map(p => fakeBlock(p)).toList
    val keyEvents = Range(ofWhichKeyEvents, 0, -1).map(p => fakeBlock(p, true)).toList
    regular ++ keyEvents
  }

  "firstPage" should "allow 1 block on one page" in {
    val result =
      LiveBlogCurrentPage.firstPage(
        2,
        Blocks(1, Nil, None, Map(CanonicalLiveBlog.firstPage -> Seq(fakeBlock(1)))),
        false,
      )

    result should be(
      Some(LiveBlogCurrentPage(currentPage = FirstPage(Seq(fakeBlock(1)), filterKeyEvents = false), pagination = None)),
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
      false,
    )

    should(result, FirstPage(blocks, filterKeyEvents = false), None)
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
      false,
    )

    val expected = blocks.take(2)
    val expectedOldestPage = BlockPage(blocks = Nil, blockId = "1", pageNumber = 2, filterKeyEvents = false)
    val expectedOlderPage = BlockPage(blocks = Nil, blockId = "2", pageNumber = 2, filterKeyEvents = false)
    val expectedPagination = Some(
      N1Pagination(
        newest = None,
        newer = None,
        older = Some(expectedOlderPage),
        oldest = Some(expectedOldestPage),
        numberOfPages = 2,
      ),
    )

    should(result, currentPage = FirstPage(expected, false), pagination = expectedPagination)
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
      false,
    )

    val expectedCurrentPage = FirstPage(blocks = blocks.take(3), filterKeyEvents = false)
    val expectedOldestPage = BlockPage(blocks = Nil, blockId = "1", pageNumber = 2, filterKeyEvents = false)
    val expectedOlderPage = BlockPage(blocks = Nil, blockId = "2", pageNumber = 2, filterKeyEvents = false)
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

  it should "only display key events" in {
    val blocks = fakeBlocks(10, 5)
    val keyBlocks = blocks.filter(_.eventType == KeyEvent)
    val result = LiveBlogCurrentPage.firstPage(
      2,
      Blocks(
        5,
        Nil,
        None,
        Map(
          CanonicalLiveBlog.firstPage -> blocks.take(4),
          CanonicalLiveBlog.oldestPage -> blocks.lastOption.toSeq,
          CanonicalLiveBlog.timeline -> keyBlocks,
        ),
      ),
      true,
    )

    val expectedCurrentPage = FirstPage(blocks = keyBlocks.take(3), filterKeyEvents = true)
    val expectedOldestPage = BlockPage(blocks = Nil, blockId = "1", pageNumber = 2, filterKeyEvents = true)
    val expectedOlderPage = BlockPage(blocks = Nil, blockId = "2", pageNumber = 2, filterKeyEvents = true)
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
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "2", false)

    val expectedCurrentPage =
      BlockPage(blocks = blocks.takeRight(2), blockId = "2", pageNumber = 2, filterKeyEvents = false)
    val expectedNewestPage = FirstPage(blocks.take(2), filterKeyEvents = false)
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
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "1", false)

    val expectedCurrentPage =
      BlockPage(blocks = blocks.takeRight(2), blockId = "2", pageNumber = 2, filterKeyEvents = false)
    val expectedNewestPage = FirstPage(blocks.take(2), filterKeyEvents = false)
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
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "2", false)

    val expectedCurrentPage =
      BlockPage(blocks = blocks.takeRight(2), blockId = "2", pageNumber = 2, filterKeyEvents = false)
    val expectedNewestPage = FirstPage(blocks.take(3), filterKeyEvents = false)
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
      false,
    )

    val expectedCurrentPage = FirstPage(blocks = blocks.take(2), filterKeyEvents = false)
    val expectedMiddlePage = BlockPage(blocks = Nil, blockId = "4", pageNumber = 2, filterKeyEvents = false)
    val expectedOldestPage = BlockPage(blocks = Nil, blockId = "1", pageNumber = 3, filterKeyEvents = false)
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
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "4", false)

    val expectedCurrentPage =
      BlockPage(blocks = blocks.slice(2, 4), blockId = "4", pageNumber = 2, filterKeyEvents = false)
    val expectedFirstPage = FirstPage(blocks = blocks.take(2), filterKeyEvents = false)
    val expectedOlderPage =
      BlockPage(blocks = blocks.takeRight(2), blockId = "2", pageNumber = 3, filterKeyEvents = false)
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
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "2", false)

    val expectedCurrentPage =
      BlockPage(blocks = blocks.takeRight(2), blockId = "2", pageNumber = 3, filterKeyEvents = false)
    val expectedFirstPage = FirstPage(blocks = blocks.take(2), filterKeyEvents = false)
    val expectedMiddlePage =
      BlockPage(blocks = blocks.slice(2, 4), blockId = "4", pageNumber = 2, filterKeyEvents = false)
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

  it should "display only key events when the filter is on" in {
    val blocks = fakeBlocks(12, 6)
    val keyBlocks = blocks.filter(_.eventType == KeyEvent)
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "2", true)

    val expectedCurrentPage =
      BlockPage(blocks = keyBlocks.takeRight(2), blockId = "2", pageNumber = 3, filterKeyEvents = true)
    val expectedFirstPage = FirstPage(blocks = keyBlocks.take(2), filterKeyEvents = true)
    val expectedMiddlePage =
      BlockPage(blocks = keyBlocks.slice(2, 4), blockId = "4", pageNumber = 2, filterKeyEvents = true)
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

  it should "display nothing when no key events exist and the filter is on" in {
    val blocks = fakeBlocks(6, 0)
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "2", true)

    result should be(None)
  }

}
