package liveblog

import org.scalatest.{FlatSpec, Matchers}

class LiveBlogPageModelTest extends FlatSpec with Matchers {

   "LiveBlogPageModel" should "allow 1 block on one page" in {
     val result = LiveBlogPageModel(2, Seq(()))(isRequestedBlock = None, id = _.toString)

     result.map(_.copy(allBlocks = Seq())) should be(Some(LiveBlogPageModel(allBlocks = Seq(), currentPage = FirstPage(Seq(())), pagination = None)))

   }

  "LiveBlogPageModel" should "allow 3 blocks on one page" in {
    val blocks = Seq.fill(3)(())
    val result = LiveBlogPageModel(2, blocks)(None, _.toString)

    result.map(_.copy(allBlocks = Seq())) should be(Some(LiveBlogPageModel(allBlocks = Seq(), currentPage = FirstPage(blocks), pagination = None)))

  }

  "LiveBlogPageModel" should "put 4 blocks on two pages (main page)" in {
    val blocks = Seq.fill(4)(()).zipWithIndex.map(_._2).map {
      case x: Int if x < 2 => s"new $x"
      case x: Int => s"old $x"
    }
    val result = LiveBlogPageModel(2, blocks)(None, _.toString)

    val expected = blocks.take(2)
    val expectedOldestPage = BlockPage(blocks = blocks.drop(2), blockId = "old 2", pageNumber = 2)
    val expectedPagination = Some(Pagination(newest = None, newer = None, older = Some(expectedOldestPage), oldest = Some(expectedOldestPage), pagesLength = 2))

    result.map(_.copy(allBlocks = Seq())) should be(Some(LiveBlogPageModel(
      allBlocks = Seq(),
      currentPage = FirstPage(expected),
      pagination = expectedPagination
    )))

  }

  "LiveBlogPageModel" should "put 4 blocks on two pages - canonical link" in {
    val blocks = Seq.fill(4)(()).zipWithIndex.map(_._2).map {
      case x: Int if x < 2 => s"new $x"
      case x: Int => s"old $x"
    }
    val result = LiveBlogPageModel(2, blocks)(Some(_ == "old 2"), _.toString)

    val expectedCurrentPage = BlockPage(blocks = blocks.takeRight(2), blockId = "old 2", pageNumber = 2)
    val expectedNewestPage = FirstPage(blocks.take(2))
    val expectedPagination = Some(Pagination(newest = Some(expectedNewestPage), newer = Some(expectedNewestPage), older = None, oldest = None, pagesLength = 2))

    result.map(_.copy(allBlocks = Seq())) should be(Some(LiveBlogPageModel(
      allBlocks = Seq(),
      currentPage = expectedCurrentPage,
      pagination = expectedPagination
    )))

  }

  "LiveBlogPageModel" should "put 4 blocks on two pages - link to another block on the page" in {
    val blocks = Seq.fill(4)(()).zipWithIndex.map(_._2).map {
      case x: Int if x < 2 => s"new $x"
      case x: Int => s"old $x"
    }
    val result = LiveBlogPageModel(2, blocks)(Some(_ == "old 3"), _.toString)

    val expectedCurrentPage = BlockPage(blocks = blocks.takeRight(2), blockId = "old 2", pageNumber = 2)
    val expectedNewestPage = FirstPage(blocks.take(2))
    val expectedPagination = Some(Pagination(newest = Some(expectedNewestPage), newer = Some(expectedNewestPage), older = None, oldest = None, pagesLength = 2))

    result.map(_.copy(allBlocks = Seq())) should be(Some(LiveBlogPageModel(
      allBlocks = Seq(),
      currentPage = expectedCurrentPage,
      pagination = expectedPagination
    )))

  }

  "LiveBlogPageModel" should "put 5 blocks on two pages (main page)" in {
    val blocks = Seq.fill(5)(()).zipWithIndex.map(_._2)
    val result = LiveBlogPageModel(2, blocks)(None, _.toString)

    val expectedCurrentPage = FirstPage(blocks = blocks.take(3))
    val expectedOldestPage = BlockPage(blocks = blocks.drop(3), blockId = "3", pageNumber = 2)
    val expectedPagination = Some(Pagination(newest = None, newer = None, older = Some(expectedOldestPage), oldest = Some(expectedOldestPage), pagesLength = 2))

    result.map(_.copy(allBlocks = Seq())) should be(Some(LiveBlogPageModel(
      allBlocks = Seq(),
      currentPage = expectedCurrentPage,
      pagination = expectedPagination
    )))

  }

  "LiveBlogPageModel" should "put 5 blocks on two pages (block 3 from oldest page)" in {
    val blocks = Seq.fill(5)(()).zipWithIndex.map(_._2)
    val result = LiveBlogPageModel(2, blocks)(Some(_ == 3), _.toString)

    val expectedCurrentPage = BlockPage(blocks = blocks.takeRight(2), blockId = "3", pageNumber = 2)
    val expectedNewestPage = FirstPage(blocks.take(3))
    val expectedPagination = Some(Pagination(newest = Some(expectedNewestPage), newer = Some(expectedNewestPage), older = None, oldest = None, pagesLength = 2))

    result.map(_.copy(allBlocks = Seq())) should be(Some(LiveBlogPageModel(
      allBlocks = Seq(),
      currentPage = expectedCurrentPage,
      pagination = expectedPagination
    )))

  }

  "LiveBlogPageModel" should "put 6 blocks on 3 pages (main page)" in {
    val blocks = Seq.fill(6)(()).zipWithIndex.map(_._2)
    val result = LiveBlogPageModel(2, blocks)(None, _.toString)

    val expectedCurrentPage = FirstPage(blocks = blocks.take(2))
    val expectedMiddlePage = BlockPage(blocks = blocks.drop(2).take(2), blockId = "2", pageNumber = 2)
    val expectedOldestPage = BlockPage(blocks = blocks.takeRight(2), blockId = "4", pageNumber = 3)
    val expectedPagination = Some(Pagination(newest = None, newer = None, older = Some(expectedMiddlePage), oldest = Some(expectedOldestPage), pagesLength = 3))

    result.map(_.copy(allBlocks = Seq())) should be(Some(LiveBlogPageModel(
      allBlocks = Seq(),
      currentPage = expectedCurrentPage,
      pagination = expectedPagination
    )))

  }

  "LiveBlogPageModel" should "put 6 blocks on 3 pages (middle page)" in {
    val blocks = Seq.fill(6)(()).zipWithIndex.map(_._2)
    val result = LiveBlogPageModel(2, blocks)(Some(_ == 2), _.toString)

    val expectedCurrentPage = BlockPage(blocks = blocks.drop(2).take(2), blockId = "2", pageNumber = 2)
    val expectedFirstPage = FirstPage(blocks = blocks.take(2))
    val expectedOldestPage = BlockPage(blocks = blocks.takeRight(2), blockId = "4", pageNumber = 3)
    val expectedPagination = Some(Pagination(newest = Some(expectedFirstPage), newer = Some(expectedFirstPage), older = Some(expectedOldestPage), oldest = Some(expectedOldestPage), pagesLength = 3))

    result.map(_.copy(allBlocks = Seq())) should be(Some(LiveBlogPageModel(
      allBlocks = Seq(),
      currentPage = expectedCurrentPage,
      pagination = expectedPagination
    )))

  }

  "LiveBlogPageModel" should "put 6 blocks on 3 pages (oldest page)" in {
    val blocks = Seq.fill(6)(()).zipWithIndex.map(_._2)
    val result = LiveBlogPageModel(2, blocks)(Some(_ == 4), _.toString)

    val expectedCurrentPage = BlockPage(blocks = blocks.takeRight(2), blockId = "4", pageNumber = 3)
    val expectedFirstPage = FirstPage(blocks = blocks.take(2))
    val expectedMiddlePage = BlockPage(blocks = blocks.drop(2).take(2), blockId = "2", pageNumber = 2)
    val expectedPagination = Some(Pagination(newest = Some(expectedFirstPage), newer = Some(expectedMiddlePage), older = None, oldest = None, pagesLength = 3))

    result.map(_.copy(allBlocks = Seq())) should be(Some(LiveBlogPageModel(
      allBlocks = Seq(),
      currentPage = expectedCurrentPage,
      pagination = expectedPagination
    )))

  }
}
