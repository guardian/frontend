package liveblog

import model.liveblog.{BlockAttributes, BodyBlock}
import org.scalatest.{FlatSpec, Matchers}

class LiveBlogCurrentPageTest extends FlatSpec with Matchers {

  def fakeBlock(id: String = "") = BodyBlock(id, "","",None,BlockAttributes(false, false), false, None, None, None,None,Nil,Nil)

  "LiveBlogPageModel" should "allow 1 block on one page" in {
    val result = LiveBlogCurrentPage(2, Seq(fakeBlock()), None)

    result should be(Some(LiveBlogCurrentPage(currentPage = FirstPage(Seq(fakeBlock())), pagination = None)))

  }

  "LiveBlogPageModel" should "allow 3 blocks on one page" in {
    val blocks = Seq.fill(3)(fakeBlock())
    val result = LiveBlogCurrentPage(2, blocks, None)

    result should be(Some(LiveBlogCurrentPage(currentPage = FirstPage(blocks), pagination = None)))

  }

  "LiveBlogPageModel" should "put 4 blocks on two pages (main page)" in {
    val blocks = Seq.fill(4)(()).zipWithIndex.map(_._2).map {
      case x: Int if x < 2 => fakeBlock(s"new $x")
      case x: Int => fakeBlock(s"old $x")
    }
    val result = LiveBlogCurrentPage(2, blocks, None)

    val expected = blocks.take(2)
    val expectedOldestPage = BlockPage(blocks = blocks.drop(2), blockId = "old 2", pageNumber = 2)
    val expectedPagination = Some(Pagination(newest = None, newer = None, older = Some(expectedOldestPage), oldest = Some(expectedOldestPage), numberOfPages = 2))

    result should be(Some(LiveBlogCurrentPage(
      currentPage = FirstPage(expected),
      pagination = expectedPagination
    )))

  }

  "LiveBlogPageModel" should "put 4 blocks on two pages - older page link" in {
    val blocks = Seq.fill(4)(()).zipWithIndex.map(_._2).map {
      case x: Int if x < 2 => fakeBlock(s"new $x")
      case x: Int => fakeBlock(s"old $x")
    }
    val result = LiveBlogCurrentPage(2, blocks, Some("old 2"))

    val expectedCurrentPage = BlockPage(blocks = blocks.takeRight(2), blockId = "old 2", pageNumber = 2)
    val expectedNewestPage = FirstPage(blocks.take(2))
    val expectedPagination = Some(Pagination(newest = Some(expectedNewestPage), newer = Some(expectedNewestPage), older = None, oldest = None, numberOfPages = 2))

    result should be(Some(LiveBlogCurrentPage(
      currentPage = expectedCurrentPage,
      pagination = expectedPagination
    )))

  }

  "LiveBlogPageModel" should "put 4 blocks on two pages - link to another block on the page" in {
    val blocks = Seq.fill(4)(()).zipWithIndex.map(_._2).map {
      case x: Int if x < 2 => fakeBlock(s"new $x")
      case x: Int => fakeBlock(s"old $x")
    }
    val result = LiveBlogCurrentPage(2, blocks, Some("old 3"))

    val expectedCurrentPage = BlockPage(blocks = blocks.takeRight(2), blockId = "old 2", pageNumber = 2)
    val expectedNewestPage = FirstPage(blocks.take(2))
    val expectedPagination = Some(Pagination(newest = Some(expectedNewestPage), newer = Some(expectedNewestPage), older = None, oldest = None, numberOfPages = 2))

    result should be(Some(LiveBlogCurrentPage(
      currentPage = expectedCurrentPage,
      pagination = expectedPagination
    )))

  }

  "LiveBlogPageModel" should "put 5 blocks on two pages (main page)" in {
    val blocks = Seq.fill(5)(()).zipWithIndex.map(_._2.toString).map(fakeBlock)
    val result = LiveBlogCurrentPage(2, blocks, None)

    val expectedCurrentPage = FirstPage(blocks = blocks.take(3))
    val expectedOldestPage = BlockPage(blocks = blocks.drop(3), blockId = "3", pageNumber = 2)
    val expectedPagination = Some(Pagination(newest = None, newer = None, older = Some(expectedOldestPage), oldest = Some(expectedOldestPage), numberOfPages = 2))

    result should be(Some(LiveBlogCurrentPage(
      currentPage = expectedCurrentPage,
      pagination = expectedPagination
    )))

  }

  "LiveBlogPageModel" should "put 5 blocks on two pages (block 3 from oldest page)" in {
    val blocks = Seq.fill(5)(()).zipWithIndex.map(_._2.toString).map(fakeBlock)
    val result = LiveBlogCurrentPage(2, blocks, Some("3"))

    val expectedCurrentPage = BlockPage(blocks = blocks.takeRight(2), blockId = "3", pageNumber = 2)
    val expectedNewestPage = FirstPage(blocks.take(3))
    val expectedPagination = Some(Pagination(newest = Some(expectedNewestPage), newer = Some(expectedNewestPage), older = None, oldest = None, numberOfPages = 2))

    result should be(Some(LiveBlogCurrentPage(
      currentPage = expectedCurrentPage,
      pagination = expectedPagination
    )))

  }

  "LiveBlogPageModel" should "put 6 blocks on 3 pages (main page)" in {
    val blocks = Seq.fill(6)(()).zipWithIndex.map(_._2.toString).map(fakeBlock)
    val result = LiveBlogCurrentPage(2, blocks, None)

    val expectedCurrentPage = FirstPage(blocks = blocks.take(2))
    val expectedMiddlePage = BlockPage(blocks = blocks.drop(2).take(2), blockId = "2", pageNumber = 2)
    val expectedOldestPage = BlockPage(blocks = blocks.takeRight(2), blockId = "4", pageNumber = 3)
    val expectedPagination = Some(Pagination(newest = None, newer = None, older = Some(expectedMiddlePage), oldest = Some(expectedOldestPage), numberOfPages = 3))

    result should be(Some(LiveBlogCurrentPage(
      currentPage = expectedCurrentPage,
      pagination = expectedPagination
    )))

  }

  "LiveBlogPageModel" should "put 6 blocks on 3 pages (middle page)" in {
    val blocks = Seq.fill(6)(()).zipWithIndex.map(_._2.toString).map(fakeBlock)
    val result = LiveBlogCurrentPage(2, blocks, Some("2"))

    val expectedCurrentPage = BlockPage(blocks = blocks.drop(2).take(2), blockId = "2", pageNumber = 2)
    val expectedFirstPage = FirstPage(blocks = blocks.take(2))
    val expectedOldestPage = BlockPage(blocks = blocks.takeRight(2), blockId = "4", pageNumber = 3)
    val expectedPagination = Some(Pagination(newest = Some(expectedFirstPage), newer = Some(expectedFirstPage), older = Some(expectedOldestPage), oldest = Some(expectedOldestPage), numberOfPages = 3))

    result should be(Some(LiveBlogCurrentPage(
      currentPage = expectedCurrentPage,
      pagination = expectedPagination
    )))

  }

  "LiveBlogPageModel" should "put 6 blocks on 3 pages (oldest page)" in {
    val blocks = Seq.fill(6)(()).zipWithIndex.map(_._2.toString).map(fakeBlock)
    val result = LiveBlogCurrentPage(2, blocks, Some("4"))

    val expectedCurrentPage = BlockPage(blocks = blocks.takeRight(2), blockId = "4", pageNumber = 3)
    val expectedFirstPage = FirstPage(blocks = blocks.take(2))
    val expectedMiddlePage = BlockPage(blocks = blocks.drop(2).take(2), blockId = "2", pageNumber = 2)
    val expectedPagination = Some(Pagination(newest = Some(expectedFirstPage), newer = Some(expectedMiddlePage), older = None, oldest = None, numberOfPages = 3))

    result should be(Some(LiveBlogCurrentPage(
      currentPage = expectedCurrentPage,
      pagination = expectedPagination
    )))

  }

}
