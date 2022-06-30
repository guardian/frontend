package model

import model.liveblog.BodyBlock.{KeyEvent, SummaryEvent}
import model.liveblog._
import model.TopMentionsTopicType.TopMentionsTopicType
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

  "LiveBlogCurrentPage.apply" should "create first page given a block range of TopicsLiveBlog" in {
    val range = TopicsLiveBlog
    val result = LiveBlogCurrentPage.apply(
      pageSize = 10,
      blocks = Blocks(1, Seq(), None, Map()),
      range,
      filterKeyEvents = false,
      topicResult = Some(
        TopicResult(
          `type` = TopMentionsTopicType.Org,
          name = "someName",
          blocks = Seq(),
          count = 0,
          percentage_blocks = 0,
        ),
      ),
    )

    result.get.currentPage shouldBe (a[FirstPage])
  }

  "firstPage" should "allow 1 block on one page" in {
    val result = {
      LiveBlogCurrentPage.firstPage(
        2,
        Blocks(1, Nil, None, Map(CanonicalLiveBlog.firstPage -> Seq(fakeBlock(1)))),
        false,
        None,
      )
    }

    result should be(
      Some(
        LiveBlogCurrentPage(
          currentPage = FirstPage(Seq(fakeBlock(1)), filterKeyEvents = false, topicResult = None),
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
      false,
      None,
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
      false,
      None,
    )

    result.get.pinnedBlock should be(Some(expectedPinnedBlock))
    result.get.currentPage.blocks.headOption.get.id should not be (expectedPinnedBlock.id)
  }

  it should "still include pinned post when filtering for key events" in {
    val blocks = fakeBlocks(10, 3, 4)
    val expectedPinnedBlock = fakeBlock(4, false, true).copy(id = "4-pinned")
    val requestedBodyBlocks = Map(
      CanonicalLiveBlog.firstPage -> blocks.take(3),
      CanonicalLiveBlog.pinned -> blocks.slice(6, 10),
      CanonicalLiveBlog.timeline -> blocks.slice(3, 6),
      CanonicalLiveBlog.oldestPage -> blocks.lastOption.toSeq,
      CanonicalLiveBlog.summary -> Seq.empty,
    )
    val result = LiveBlogCurrentPage.firstPage(
      2,
      Blocks(
        3,
        Nil,
        None,
        requestedBodyBlocks,
      ),
      true,
      None,
    )

    result.get.pinnedBlock should be(Some(expectedPinnedBlock))
  }

  it should "return none when no summary key exist in requestedBodyBlocks and the filter is on" in {
    val blocks = fakeBlocks(5, 4)
    val requestedBodyBlocks = Map(
      CanonicalLiveBlog.firstPage -> blocks.take(3),
      CanonicalLiveBlog.pinned -> List(),
      CanonicalLiveBlog.timeline -> blocks.take(6),
      CanonicalLiveBlog.oldestPage -> blocks.lastOption.toSeq,
    );
    val result = LiveBlogCurrentPage.firstPage(
      2,
      Blocks(
        3,
        Nil,
        None,
        requestedBodyBlocks,
      ),
      true,
      None,
    )

    result should be(None)
  }

  it should "return none when no key events key exist in requestedBodyBlocks and the filter is on" in {
    val blocks = fakeBlocks(5, 0, 0, 4)
    val requestedBodyBlocks = Map(
      CanonicalLiveBlog.firstPage -> blocks.take(3),
      CanonicalLiveBlog.pinned -> List(),
      CanonicalLiveBlog.summary -> blocks.take(6),
      CanonicalLiveBlog.oldestPage -> blocks.lastOption.toSeq,
    )
    val result = LiveBlogCurrentPage.firstPage(
      2,
      Blocks(
        3,
        Nil,
        None,
        requestedBodyBlocks,
      ),
      true,
      None,
    )

    result should be(None)
  }

  it should "display a page with no blocks when in requestedBodyBlocks key events and summary lists are empty and filter is on" in {
    val blocks = fakeBlocks(5, 0, 0, 4)
    val requestedBodyBlocks = Map(
      CanonicalLiveBlog.firstPage -> blocks.take(3),
      CanonicalLiveBlog.pinned -> List(),
      CanonicalLiveBlog.timeline -> List(),
      CanonicalLiveBlog.summary -> List(),
      CanonicalLiveBlog.oldestPage -> blocks.lastOption.toSeq,
    )
    val result = LiveBlogCurrentPage.firstPage(
      2,
      Blocks(
        3,
        Nil,
        None,
        requestedBodyBlocks,
      ),
      true,
      None,
    )

    should(result, currentPage = FirstPage(List(), true, topicResult = None), pagination = None)
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
      None,
    )

    should(result, FirstPage(blocks, filterKeyEvents = false, topicResult = None), None)
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
      None,
    )

    val expected = blocks.take(2)
    val expectedOldestPage =
      BlockPage(blocks = Nil, blockId = "1", pageNumber = 2, filterKeyEvents = false, topicResult = None)
    val expectedOlderPage =
      BlockPage(blocks = Nil, blockId = "2", pageNumber = 2, filterKeyEvents = false, topicResult = None)
    val expectedPagination = Some(
      N1Pagination(
        newest = None,
        newer = None,
        older = Some(expectedOlderPage),
        oldest = Some(expectedOldestPage),
        numberOfPages = 2,
      ),
    )

    should(result, currentPage = FirstPage(expected, false, None), pagination = expectedPagination)
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
      None,
    )

    val expectedCurrentPage = FirstPage(blocks = blocks.take(3), filterKeyEvents = false, topicResult = None)
    val expectedOldestPage =
      BlockPage(blocks = Nil, blockId = "1", pageNumber = 2, filterKeyEvents = false, topicResult = None)
    val expectedOlderPage =
      BlockPage(blocks = Nil, blockId = "2", pageNumber = 2, filterKeyEvents = false, topicResult = None)
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

  it should "only display key events and summaries" in {
    // fakeBlocks returns 11 blocks =>  3 regular blocks, 5 key event blocks, 1 pinned blocks and 2 summary blocks
    val blocks = fakeBlocks(11, 5, 1, 2)
    val keyBlocks = blocks.filter(_.eventType == KeyEvent)
    val summaryBlocks = blocks.filter(_.eventType == SummaryEvent)
    val result = LiveBlogCurrentPage.firstPage(
      2,
      Blocks(
        5,
        Nil,
        None,
        Map(
          CanonicalLiveBlog.firstPage -> blocks.take(4),
          CanonicalLiveBlog.oldestPage -> blocks.takeRight(2),
          CanonicalLiveBlog.timeline -> keyBlocks,
          CanonicalLiveBlog.summary -> summaryBlocks,
        ),
      ),
      true,
      None,
    )

    val expectedCurrentPage = FirstPage(blocks = keyBlocks.take(3), filterKeyEvents = true, topicResult = None)
    val expectedOldestPage =
      BlockPage(blocks = Nil, blockId = "1", pageNumber = 3, filterKeyEvents = true, topicResult = None)
    val expectedOlderPage =
      BlockPage(blocks = Nil, blockId = "5", pageNumber = 2, filterKeyEvents = true, topicResult = None)
    val expectedPagination = Some(
      N1Pagination(
        newest = None,
        newer = None,
        older = Some(expectedOlderPage),
        oldest = Some(expectedOldestPage),
        numberOfPages = 3,
      ),
    )

    should(result, currentPage = expectedCurrentPage, pagination = expectedPagination)
  }

  it should "only filters blocks by key events given both key events and top mentions are provided" in {
    val topicResult = getFakeTopicResult(TopMentionsTopicType.Org, "tfl", Seq("1", "3"))
    val testFakeBlocks = TestFakeBlocks(numberOfBlocks = 5, numberOfKeyEventsBlocks = 2, None)
    val result =
      LiveBlogCurrentPage.firstPage(
        pageSize = 2,
        blocks = testFakeBlocks.blocksType,
        filterKeyEvents = true,
        topicResult = Some(topicResult),
      )

    result.get should be(
      LiveBlogCurrentPage(
        currentPage = FirstPage(
          testFakeBlocks.blocksSequence.slice(3, 5),
          filterKeyEvents = true,
          topicResult = Some(topicResult),
        ),
        pagination = None,
        pinnedBlock = None,
      ),
    )
  }

  it should "returns the 1st page of the topic filtered blocks" in {
    val topicResult = getFakeTopicResult(TopMentionsTopicType.Org, "tfl", Seq("1", "2", "3", "4"))
    val testFakeBlocks = TestFakeBlocks(numberOfBlocks = 5, numberOfKeyEventsBlocks = 2, None)
    val result =
      LiveBlogCurrentPage.firstPage(
        pageSize = 2,
        blocks = testFakeBlocks.blocksType,
        filterKeyEvents = false,
        topicResult = Some(topicResult),
      )

    val expectedPagination = Some(
      N1Pagination(
        newest = None,
        newer = None,
        older = Some(
          BlockPage(
            blocks = Nil,
            blockId = "2",
            pageNumber = 2,
            filterKeyEvents = false,
            topicResult = Some(topicResult),
          ),
        ),
        oldest = Some(
          BlockPage(
            blocks = Nil,
            blockId = "1",
            pageNumber = 2,
            filterKeyEvents = false,
            topicResult = Some(topicResult),
          ),
        ),
        numberOfPages = 2,
      ),
    )

    should(
      result,
      currentPage = FirstPage(
        testFakeBlocks.blocksSequence.slice(1, 3),
        filterKeyEvents = false,
        topicResult = Some(topicResult),
      ),
      pagination = expectedPagination,
    )
  }

  "findPageWithBlock" should "put 4 blocks on two pages - older page link" in {
    val blocks = fakeBlocks(4)
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "2", false, None)

    val expectedCurrentPage =
      BlockPage(
        blocks = blocks.takeRight(2),
        blockId = "2",
        pageNumber = 2,
        filterKeyEvents = false,
        topicResult = None,
      )
    val expectedNewestPage = FirstPage(blocks.take(2), filterKeyEvents = false, topicResult = None)
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
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "1", false, None)

    val expectedCurrentPage =
      BlockPage(
        blocks = blocks.takeRight(2),
        blockId = "2",
        pageNumber = 2,
        filterKeyEvents = false,
        topicResult = None,
      )
    val expectedNewestPage = FirstPage(blocks.take(2), filterKeyEvents = false, topicResult = None)
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
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "2", false, None)

    val expectedCurrentPage =
      BlockPage(
        blocks = blocks.takeRight(2),
        blockId = "2",
        pageNumber = 2,
        filterKeyEvents = false,
        topicResult = None,
      )
    val expectedNewestPage = FirstPage(blocks.take(3), filterKeyEvents = false, topicResult = None)
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
      None,
    )

    val expectedCurrentPage = FirstPage(blocks = blocks.take(2), filterKeyEvents = false, topicResult = None)
    val expectedMiddlePage =
      BlockPage(blocks = Nil, blockId = "4", pageNumber = 2, filterKeyEvents = false, topicResult = None)
    val expectedOldestPage =
      BlockPage(blocks = Nil, blockId = "1", pageNumber = 3, filterKeyEvents = false, topicResult = None)
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
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "4", false, None)

    val expectedCurrentPage =
      BlockPage(
        blocks = blocks.slice(2, 4),
        blockId = "4",
        pageNumber = 2,
        filterKeyEvents = false,
        topicResult = None,
      )
    val expectedFirstPage = FirstPage(blocks = blocks.take(2), filterKeyEvents = false, topicResult = None)
    val expectedOlderPage =
      BlockPage(
        blocks = blocks.takeRight(2),
        blockId = "2",
        pageNumber = 3,
        filterKeyEvents = false,
        topicResult = None,
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
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "2", false, None)

    val expectedCurrentPage =
      BlockPage(
        blocks = blocks.takeRight(2),
        blockId = "2",
        pageNumber = 3,
        filterKeyEvents = false,
        topicResult = None,
      )
    val expectedFirstPage = FirstPage(blocks = blocks.take(2), filterKeyEvents = false, topicResult = None)
    val expectedMiddlePage =
      BlockPage(
        blocks = blocks.slice(2, 4),
        blockId = "4",
        pageNumber = 2,
        filterKeyEvents = false,
        topicResult = None,
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

  it should "display only key events and summaries when the filter is on" in {
    val blocks = fakeBlocks(12, 4, 0, 2)
    val keyAndSummaryBlocks = blocks.filter(block => block.eventType == KeyEvent || block.eventType == SummaryEvent)
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "2", true, None)

    val expectedCurrentPage = {
      BlockPage(
        blocks = keyAndSummaryBlocks.takeRight(2),
        blockId = "2",
        pageNumber = 3,
        filterKeyEvents = true,
        topicResult = None,
      )
    }
    val expectedFirstPage =
      FirstPage(blocks = keyAndSummaryBlocks.take(2), filterKeyEvents = true, topicResult = None)
    val expectedMiddlePage =
      BlockPage(
        blocks = keyAndSummaryBlocks.slice(2, 4),
        blockId = "4",
        pageNumber = 2,
        filterKeyEvents = true,
        topicResult = None,
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

  it should "display nothing when no key events exist and the filter is on" in {
    val blocks = fakeBlocks(6, 0)
    val result = LiveBlogCurrentPage.findPageWithBlock(2, blocks, "2", true, None)

    result should be(None)
  }

  it should "returns the correct 2nd page of the topic filtered blocks" in {
    val topicResult = getFakeTopicResult(TopMentionsTopicType.Org, "tfl", Seq("2", "3", "4", "5", "6"))
    val testFakeBlocks = TestFakeBlocks(numberOfBlocks = 8, numberOfKeyEventsBlocks = 2, None)

    val expectedFirstPage = FirstPage(
      testFakeBlocks.blocksSequence.slice(2, 5),
      filterKeyEvents = false,
      topicResult = Some(topicResult),
    )
    val expectedCurrentPage = BlockPage(
      blocks = testFakeBlocks.blocksSequence.slice(5, 7),
      blockId = "3",
      pageNumber = 2,
      filterKeyEvents = false,
      topicResult = Some(topicResult),
    )
    val expectedPagination = Some(
      N1Pagination(
        newest = Some(expectedFirstPage),
        newer = Some(expectedFirstPage),
        older = None,
        oldest = None,
        numberOfPages = 2,
      ),
    )

    val result = LiveBlogCurrentPage.findPageWithBlock(
      pageSize = 2,
      blocks = testFakeBlocks.blocksSequence,
      isRequestedBlock = "3",
      filterKeyEvents = false,
      topicResult = Some(topicResult),
    )

    should(result, expectedCurrentPage, expectedPagination)
  }

  "updates" should "return only the topic filtered blocks after the lastUpdated block given lastUpdated is also a topic block" in {
    val topicResult = getFakeTopicResult(TopMentionsTopicType.Org, "tfl", Seq("2", "3", "4", "5", "6"))
    val sinceBlock = SinceBlockId("5")
    val testFakeBlocks = TestFakeBlocks(numberOfBlocks = 8, numberOfKeyEventsBlocks = 2, Some("5"))

    val result = LiveBlogCurrentPage.updates(
      blocks = testFakeBlocks.blocksType,
      sinceBlockId = SinceBlockId("5"),
      filterKeyEvents = false,
      topicResult = Some(topicResult),
    )

    result.get.currentPage.blocks.length should be(1)
    result.get.currentPage.blocks.exists(block => block.id == "6") should be(true)
  }

  "updates" should "return only the topic filtered blocks after the lastUpdated block given lastUpdated is NOT a topic block" in {
    val topicResult = getFakeTopicResult(TopMentionsTopicType.Org, "tfl", Seq("2", "3", "5", "6"))
    val sinceBlockId = "4"
    val testFakeBlocks = TestFakeBlocks(numberOfBlocks = 8, numberOfKeyEventsBlocks = 2, Some(sinceBlockId))

    val result = LiveBlogCurrentPage.updates(
      blocks = testFakeBlocks.blocksType,
      sinceBlockId = SinceBlockId(sinceBlockId),
      filterKeyEvents = false,
      topicResult = Some(topicResult),
    )

    result.get.currentPage.blocks.length should be(2)
    result.get.currentPage.blocks(0).id should be("6")
    result.get.currentPage.blocks(1).id should be("5")
  }

  private def getFakeTopicResult(
      topicType: TopMentionsTopicType,
      topicName: String,
      blocks: Seq[String],
  ) = {
    TopicResult(
      `type` = topicType,
      name = topicName,
      blocks = blocks,
      count = 0,
      percentage_blocks = 0,
    )
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
