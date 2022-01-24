package model

import common.Edition
import model.liveblog.{BlockAttributes, Blocks, BodyBlock}
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}

class KeyEventDataTest extends FlatSpec with Matchers {
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
    number should be >= ofWhichKeyEvents + ofWhichPinnedBlocks + ofWhichSummaries

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

  it should "return an empty list if there are no blocks" in {
    val gotKeyEventData = KeyEventData(None, Edition.defaultEdition.timezone)

    gotKeyEventData should be(List())
  }

  it should "return an empty list if there are no blocks in body or requstedBodyBlocks" in {
    val blocks = Some(
      Blocks(
        10,
        Nil,
        None,
        Map(),
      ),
    )

    val gotKeyEventData = KeyEventData(blocks, Edition.defaultEdition.timezone)

    gotKeyEventData should be(List())
  }

  it should "return a filtered list of key event and summary ids when requestedBodyBlocks has key events and summary blocks " in {
    val blockCount = 8
    val allBlocks = fakeBlocks(blockCount, 3, 0, 3)
    val regularBlocks = allBlocks.slice(0, 2)
    val keyEventBlocks = allBlocks.slice(2, 5)
    val summaryBlocks = allBlocks.slice(5, 8)
    val requestedBodyBlocks = Map(
      CanonicalLiveBlog.timeline -> keyEventBlocks,
      CanonicalLiveBlog.summary -> summaryBlocks,
    )
    val blocks = Some(
      Blocks(
        blockCount,
        Nil,
        None,
        requestedBodyBlocks,
      ),
    )

    val keyEventData = KeyEventData(blocks, Edition.defaultEdition.timezone)

    val gotBlockIds = keyEventData.map(_.id)
    val expectedBlockIds = (keyEventBlocks ++ summaryBlocks).map(_.id)
    gotBlockIds should be(expectedBlockIds)
  }

  it should "return a filtered list of key event and summary ids when body has key events and summary blocks " in {
    val blockCount = 8
    val allBlocks = fakeBlocks(blockCount, 3, 0, 3)
    val regularBlocks = allBlocks.slice(0, 2)
    val keyEventBlocks = allBlocks.slice(2, 5)
    val summaryBlocks = allBlocks.slice(5, 8)
    val blocks = Some(
      Blocks(
        blockCount,
        allBlocks,
        None,
        Map(),
      ),
    )

    val keyEventData = KeyEventData(blocks, Edition.defaultEdition.timezone)

    val gotBlockIds = keyEventData.map(_.id)
    val expectedBlockIds = (keyEventBlocks ++ summaryBlocks).map(_.id)
    gotBlockIds should be(expectedBlockIds)
  }

  it should "return the keyEventData block ids in chronological order, newest to oldest" in {
    val oldestBlock = fakeBlock(1, true)
    val newestBlock = fakeBlock(2, true)
    val unorderedBlockList = Seq(oldestBlock, newestBlock)
    val blocks = Some(Blocks(2, unorderedBlockList, None, Map()))

    val gotKeyEventData = KeyEventData(blocks, Edition.defaultEdition.timezone)

    val gotBlockIds = gotKeyEventData.map(_.id)
    val expectedOrderedBlockIds = Seq(newestBlock.id, oldestBlock.id)
    gotBlockIds should be(expectedOrderedBlockIds)
  }
}
