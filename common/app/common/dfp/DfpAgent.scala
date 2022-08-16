package common.dfp

import common.Box
import conf.Configuration.commercial._
import conf.Configuration.environment
import play.api.libs.json.Json
import services.S3

import scala.concurrent.ExecutionContext
import scala.io.Codec.UTF8

object DfpAgent
    extends PageskinAdAgent
    with InlineMerchandiseComponentAgent
    with HighMerchandiseComponentAgent
    with AdSlotAgent {

  override protected val environmentIsProd: Boolean = environment.isProd

  private lazy val inlineMerchandisingTagsAgent = Box[InlineMerchandisingTagSet](InlineMerchandisingTagSet())
  private lazy val targetedHighMerchandisingLineItemsAgent = Box[Seq[HighMerchandisingLineItem]](Seq.empty)
  private lazy val pageskinnedAdUnitAgent = Box[Seq[PageSkinSponsorship]](Nil)
  private lazy val lineItemAgent = Box[Map[AdSlot, Seq[GuLineItem]]](Map.empty)
  private lazy val takeoverWithEmptyMPUsAgent = Box[Seq[TakeoverWithEmptyMPUs]](Nil)
  private lazy val nonRefreshableLineItemsAgent = Box[Seq[Long]](Nil)

  protected def inlineMerchandisingTargetedTags: InlineMerchandisingTagSet = inlineMerchandisingTagsAgent.get()
  protected def targetedHighMerchandisingLineItems: Seq[HighMerchandisingLineItem] =
    targetedHighMerchandisingLineItemsAgent.get()
  protected def pageSkinSponsorships: Seq[PageSkinSponsorship] = pageskinnedAdUnitAgent.get()
  protected def lineItemsBySlot: Map[AdSlot, Seq[GuLineItem]] = lineItemAgent.get()
  protected def takeoversWithEmptyMPUs: Seq[TakeoverWithEmptyMPUs] =
    takeoverWithEmptyMPUsAgent.get()

  def nonRefreshableLineItemIds(): Seq[Long] = nonRefreshableLineItemsAgent.get()

  private def stringFromS3(key: String): Option[String] = S3.get(key)(UTF8)

  private def update[T](agent: Box[Seq[T]])(freshData: => Seq[T]): Unit = {
    if (freshData.nonEmpty) {
      agent send freshData
    }
  }

  def refresh()(implicit executionContext: ExecutionContext): Unit = {

    def grabPageSkinSponsorshipsFromStore(key: String): Seq[PageSkinSponsorship] = {
      val reportOption: Option[PageSkinSponsorshipReport] = for {
        jsonString <- stringFromS3(key)
        report <- PageSkinSponsorshipReportParser(jsonString)
      } yield report

      reportOption.fold(Seq[PageSkinSponsorship]())(_.sponsorships)
    }

    def grabInlineMerchandisingTargetedTagsFromStore(): InlineMerchandisingTagSet = {
      val maybeTagSet = for {
        jsonString <- stringFromS3(dfpInlineMerchandisingTagsDataKey)
        report <- InlineMerchandisingTargetedTagsReportParser(jsonString)
      } yield report.targetedTags
      maybeTagSet getOrElse InlineMerchandisingTagSet()
    }

    def grabNonRefreshableLineItemIdsFromStore() = {
      (for {
        jsonString <- stringFromS3(dfpNonRefreshableLineItemIdsKey)
        lineItemIds <- Json.parse(jsonString).validate[Seq[Long]].asOpt
      } yield lineItemIds) getOrElse Nil
    }

    def grabTargetedHighMerchandisingLineItemFromStore(): Seq[HighMerchandisingLineItem] = {
      for {
        jsonString <- stringFromS3(dfpHighMerchandisingTagsDataKey).toSeq
        report <- HighMerchandisingTargetedTagsReportParser(jsonString).toSeq
        lineItems <- report.lineItems.items
      } yield lineItems
    }

    def updateInlineMerchandisingTargetedTags(freshData: InlineMerchandisingTagSet): Unit = {
      inlineMerchandisingTagsAgent send { oldData =>
        if (freshData.nonEmpty) freshData else oldData
      }
    }

    def updateTargetedHighMerchandisingLineItems(freshData: Seq[HighMerchandisingLineItem]): Unit = {
      targetedHighMerchandisingLineItemsAgent send { oldData =>
        if (freshData.nonEmpty) freshData else oldData
      }
    }

    update(pageskinnedAdUnitAgent)(grabPageSkinSponsorshipsFromStore(dfpPageSkinnedAdUnitsKey))

    update(nonRefreshableLineItemsAgent)(grabNonRefreshableLineItemIdsFromStore())

    updateInlineMerchandisingTargetedTags(grabInlineMerchandisingTargetedTagsFromStore())

    updateTargetedHighMerchandisingLineItems(grabTargetedHighMerchandisingLineItemFromStore())

  }

  def refreshFaciaSpecificData()(implicit executionContext: ExecutionContext): Unit = {

    def updateLineItems(slot: AdSlot, key: String): Unit = {

      def grabCurrentLineItemsFromStore(key: String): Seq[GuLineItem] = {
        val maybeLineItems = for (jsonString <- stringFromS3(key)) yield {
          Json.parse(jsonString).as[LineItemReport].lineItems
        }
        maybeLineItems getOrElse Nil
      }

      lineItemAgent send { oldData =>
        val takeovers = grabCurrentLineItemsFromStore(key)
        if (takeovers.nonEmpty) oldData + (slot -> takeovers)
        else oldData
      }

    }

    updateLineItems(TopAboveNavSlot, topAboveNavSlotTakeoversKey)

    update(takeoverWithEmptyMPUsAgent)(TakeoverWithEmptyMPUs.fetch())
  }
}
