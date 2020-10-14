package model

import model.liveblog._
import org.joda.time.DateTime
import org.scalatest.{Assertion, FlatSpec, Matchers}

class LiveBlogCurrentPageTest extends FlatSpec with Matchers {

  def fakeBlock(publicationOrder: Int): BodyBlock =
    BodyBlock(
      s"$publicationOrder",
      "",
      "",
      None,
      BlockAttributes(false, false, None),
      false,
      None,
      firstPublishedDate = Some(new DateTime(publicationOrder)),
      None,
      None,
      Nil,
      Nil,
    )

  def fakeBlocks(number: Int): List[BodyBlock] = Range(number, 0, -1).map(fakeBlock).toList

  "LiveBlogPageModel" should "allow 1 block on one page" in {
    val result = LiveBlogCurrentPage.firstPage(2, Blocks(1, Nil, None, Map(Canonical.firstPage -> Seq(fakeBlock(1)))))

    result should be(Some(LiveBlogCurrentPage(currentPage = FirstPage(Seq(fakeBlock(1))), pagination = None)))

  }

  def should(
      result: Option[LiveBlogCurrentPage],
      currentPage: PageReference,
      pagination: Option[N1Pagination],
  ): Assertion = {
    result.get.currentPage should be(currentPage)
    result.get.pagination should be(pagination)
  }

  "LiveBlogPageModel" should "allow 3 blocks on one page" in {
    val blocks = fakeBlocks(3)
    val result = LiveBlogCurrentPage.firstPage(
      2,
      Blocks(3, Nil, None, Map(Canonical.firstPage -> blocks.take(4), Canonical.oldestPage -> blocks.lastOption.toSeq)),
    )

    should(result, FirstPage(blocks), None)

  }

  "LiveBlogPageModel" should "put 4 blocks on two pages (main page)" in {
    val blocks = fakeBlocks(4)
    val result = LiveBlogCurrentPage.firstPage(
      2,
      Blocks(4, Nil, None, Map(Canonical.firstPage -> blocks.take(4), Canonical.oldestPage -> blocks.lastOption.toSeq)),
    )

    val expected = blocks.take(2)
    val expectedOldestPage = BlockPage(blocks = Nil, blockId = "1", pageNumber = 2)
    val expectedOlderPage = BlockPage(blocks = Nil, blockId = "2", pageNumber = 2)
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

  "LiveBlogPageModel" should "put 4 blocks on two pages - older page link" in {
    val blocks = fakeBlocks(4)
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "2")

    val expectedCurrentPage = BlockPage(blocks = blocks.takeRight(2), blockId = "2", pageNumber = 2)
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

  "LiveBlogPageModel" should "put 4 blocks on two pages - link to another block on the page" in {
    val blocks = fakeBlocks(4)
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "1")

    val expectedCurrentPage = BlockPage(blocks = blocks.takeRight(2), blockId = "2", pageNumber = 2)
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

  "LiveBlogPageModel" should "put 5 blocks on two pages (main page)" in {
    val blocks = fakeBlocks(5)
    val result = LiveBlogCurrentPage.firstPage(
      2,
      Blocks(5, Nil, None, Map(Canonical.firstPage -> blocks.take(4), Canonical.oldestPage -> blocks.lastOption.toSeq)),
    )

    val expectedCurrentPage = FirstPage(blocks = blocks.take(3))
    val expectedOldestPage = BlockPage(blocks = Nil, blockId = "1", pageNumber = 2)
    val expectedOlderPage = BlockPage(blocks = Nil, blockId = "2", pageNumber = 2)
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

  "LiveBlogPageModel" should "put 5 blocks on two pages (block 3 from oldest page)" in {
    val blocks = fakeBlocks(5)
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "2")

    val expectedCurrentPage = BlockPage(blocks = blocks.takeRight(2), blockId = "2", pageNumber = 2)
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

  "LiveBlogPageModel" should "put 6 blocks on 3 pages (main page)" in {
    val blocks = fakeBlocks(6)
    val result = LiveBlogCurrentPage.firstPage(
      2,
      Blocks(6, Nil, None, Map(Canonical.firstPage -> blocks.take(4), Canonical.oldestPage -> blocks.lastOption.toSeq)),
    )

    val expectedCurrentPage = FirstPage(blocks = blocks.take(2))
    val expectedMiddlePage = BlockPage(blocks = Nil, blockId = "4", pageNumber = 2)
    val expectedOldestPage = BlockPage(blocks = Nil, blockId = "1", pageNumber = 3)
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

  "LiveBlogPageModel" should "put 6 blocks on 3 pages (middle page)" in {
    val blocks = fakeBlocks(6)
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "4")

    val expectedCurrentPage = BlockPage(blocks = blocks.slice(2, 4), blockId = "4", pageNumber = 2)
    val expectedFirstPage = FirstPage(blocks = blocks.take(2))
    val expectedOlderPage = BlockPage(blocks = blocks.takeRight(2), blockId = "2", pageNumber = 3)
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

  "LiveBlogPageModel" should "put 6 blocks on 3 pages (oldest page)" in {
    val blocks = fakeBlocks(6)
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "2")

    val expectedCurrentPage = BlockPage(blocks = blocks.takeRight(2), blockId = "2", pageNumber = 3)
    val expectedFirstPage = FirstPage(blocks = blocks.take(2))
    val expectedMiddlePage = BlockPage(blocks = blocks.slice(2, 4), blockId = "4", pageNumber = 2)
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

}
