package dfp

import akka.actor.ActorSystem
import tools.BlockingOperations
import common.dfp.{GuLineItem, GuTargeting}
import org.joda.time.DateTime
import org.scalatest._
import test._

class DfpDataCacheJobTest
  extends FlatSpec
  with Matchers
  with SingleServerSuite
  with BeforeAndAfterAll
  with WithMaterializer
  with WithTestWsClient
  with WithTestContentApiClient {

  val blockingOperations = new BlockingOperations(ActorSystem())
  val adUnitAgent = new AdUnitAgent(blockingOperations)
  val adUnitService = new AdUnitService(adUnitAgent)

  val placementAgent = new PlacementAgent(blockingOperations)
  val placementService = new PlacementService(placementAgent, adUnitService)

  val customTargetingAgent = new CustomTargetingAgent(blockingOperations)
  val customTargetingService = new CustomTargetingService(customTargetingAgent)

  val customFieldAgent = new CustomFieldAgent(blockingOperations)
  val customFieldService = new CustomFieldService(customFieldAgent)

  val dataMapper = new DataMapper(
    adUnitService,
    placementService,
    customTargetingService,
    customFieldService
  )

  val dataValidation = new DataValidation(adUnitService)

  val dfpApi = new DfpApi(dataMapper, dataValidation)

  val dfpDataCacheJob = new DfpDataCacheJob(adUnitAgent, customFieldAgent, customTargetingAgent, placementAgent, dfpApi)

  private def lineItem(id: Long, name: String, completed: Boolean = false): GuLineItem = {
    GuLineItem(
      id,
      0L,
      name,
      startTime = DateTime.now.withTimeAtStartOfDay,
      endTime = None,
      isPageSkin = false,
      sponsor = None,
      status = if (completed) "COMPLETED" else "READY",
      costType = "CPM",
      creativePlaceholders = Nil,
      targeting = GuTargeting(
        adUnitsIncluded = Nil,
        adUnitsExcluded = Nil,
        geoTargetsIncluded = Nil,
        geoTargetsExcluded = Nil,
        customTargetSets = Nil
      ),
      lastModified = DateTime.now.withTimeAtStartOfDay
    )
  }

  private val cachedLineItems = DfpLineItems(
    validItems = Seq(lineItem(1, "a-cache"), lineItem(2, "b-cache"), lineItem(3, "c-cache")),
    invalidItems = Seq.empty)

  private val allReadyOrDeliveringLineItems = DfpLineItems(Seq.empty, Seq.empty)

  "loadLineItems" should "dedupe line items that have changed in an unknown way" in {
    def lineItemsModifiedSince(threshold: DateTime): DfpLineItems = DfpLineItems(
      validItems = Seq(
        lineItem(1, "a-fresh"),
        lineItem(2, "b-fresh"),
        lineItem(3, "c-fresh")
      ),
      invalidItems = Seq.empty)

    val lineItems = dfpDataCacheJob.loadLineItems(
      cachedLineItems,
      lineItemsModifiedSince,
      allReadyOrDeliveringLineItems
    )

    lineItems.validLineItems.size shouldBe 3
    lineItems.validLineItems shouldBe Seq(lineItem(1, "a-fresh"), lineItem(2, "b-fresh"), lineItem(3, "c-fresh"))
    lineItems.invalidLineItems shouldBe empty
  }

  it should "dedupe line items that have changed in a known way" in {
    def lineItemsModifiedSince(threshold: DateTime): DfpLineItems = DfpLineItems(
      validItems = Seq(
        lineItem(1, "d"),
        lineItem(2, "e"),
        lineItem(4, "f")
      ),
      invalidItems = Seq.empty)

    val lineItems = dfpDataCacheJob.loadLineItems(
      cachedLineItems,
      lineItemsModifiedSince,
      allReadyOrDeliveringLineItems
    )

    lineItems.validLineItems.size shouldBe 4
    lineItems.validLineItems shouldBe Seq(
      lineItem(1, "d"),
      lineItem(2, "e"),
      lineItem(3, "c-cache"),
      lineItem(4, "f")
    )
  }

  it should "omit line items whose state has changed to no longer be ready or delivering" in {
    def lineItemsModifiedSince(threshold: DateTime): DfpLineItems = DfpLineItems(
      validItems = Seq(
        lineItem(1, "a", completed = true),
        lineItem(2, "e"),
        lineItem(4, "f")
      ),
      invalidItems = Seq.empty)

    val lineItems = dfpDataCacheJob.loadLineItems(
      cachedLineItems,
      lineItemsModifiedSince,
      allReadyOrDeliveringLineItems
    )

    lineItems.validLineItems.size shouldBe 3
    lineItems.validLineItems shouldBe Seq(
      lineItem(2, "e"),
      lineItem(3, "c-cache"),
      lineItem(4, "f"))
  }
}
