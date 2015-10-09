package dfp

import common.dfp.{GuLineItem, GuTargeting}
import org.joda.time.DateTime
import org.scalatest._

class DfpDataCacheJobTest extends FlatSpec with Matchers {

  private def lineItem(id: Long, name: String, completed: Boolean = false): GuLineItem = {
    GuLineItem(id,
      name,
      startTime = DateTime.now.withTimeAtStartOfDay,
      endTime = None,
      isPageSkin = false,
      sponsor = None,
      status = if (completed) "COMPLETED" else "READY",
      costType = "CPM",
      creativeSizes = Nil,
      targeting = GuTargeting(adUnits = Nil,
        geoTargetsIncluded = Nil,
        geoTargetsExcluded = Nil,
        customTargetSets = Nil),
      lastModified = DateTime.now.withTimeAtStartOfDay)
  }

  private val cachedLineItems = Seq(lineItem(1, "a"), lineItem(2, "b"), lineItem(3, "c"))
  private val allReadyOrDeliveringLineItems = Nil

  "loadLineItems" should "dedup line items that have changed in an unknown way" in {
    def lineItemsModifiedSince(threshold: DateTime) = Seq(
      lineItem(1, "a"),
      lineItem(2, "b"),
      lineItem(3, "c")
    )

    val lineItems = DfpDataCacheJob.loadLineItems(
      cachedLineItems,
      lineItemsModifiedSince,
      allReadyOrDeliveringLineItems
    )

    lineItems.prevCount shouldBe 3
    lineItems.recentlyAddedIds shouldBe empty
    lineItems.recentlyModifiedIds shouldBe Set(1, 2, 3)
    lineItems.recentlyRemovedIds shouldBe empty
    lineItems.current.size shouldBe 3
    lineItems.current shouldBe Seq(lineItem(1, "a"), lineItem(2, "b"), lineItem(3, "c"))
  }

  it should "dedup line items that have changed in a known way" in {
    def lineItemsModifiedSince(threshold: DateTime) = Seq(
      lineItem(1, "d"),
      lineItem(2, "e"),
      lineItem(4, "f")
    )

    val lineItems = DfpDataCacheJob.loadLineItems(
      cachedLineItems,
      lineItemsModifiedSince,
      allReadyOrDeliveringLineItems
    )

    lineItems.prevCount shouldBe 3
    lineItems.recentlyAddedIds shouldBe Set(4)
    lineItems.recentlyModifiedIds shouldBe Set(1, 2)
    lineItems.recentlyRemovedIds shouldBe empty
    lineItems.current.size shouldBe 4
    lineItems.current shouldBe Seq(
      lineItem(1, "d"),
      lineItem(2, "e"),
      lineItem(3, "c"),
      lineItem(4, "f")
    )
  }

  it should "omit line items whose state has changed to no longer be ready or delivering" in {
    def lineItemsModifiedSince(threshold: DateTime) = Seq(
      lineItem(1, "a", completed = true),
      lineItem(2, "e"),
      lineItem(4, "f")
    )

    val lineItems = DfpDataCacheJob.loadLineItems(
      cachedLineItems,
      lineItemsModifiedSince,
      allReadyOrDeliveringLineItems
    )

    lineItems.prevCount shouldBe 3
    lineItems.recentlyAddedIds shouldBe Set(4)
    lineItems.recentlyModifiedIds shouldBe Set(2)
    lineItems.recentlyRemovedIds shouldBe Set(1)
    lineItems.current.size shouldBe 3
    lineItems.current shouldBe Seq(lineItem(2, "e"), lineItem(3, "c"), lineItem(4, "f"))
  }
}
