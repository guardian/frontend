package common.dfp

import akka.agent.Agent
import common._
import common.dfp.AdSize.{leaderboardSize, responsiveSize}
import conf.Configuration.commercial._
import conf.Configuration.environment
import play.api.Play
import play.api.libs.json.Json
import services.S3

import scala.io.Codec.UTF8

object DfpAgent
  extends PaidForTagAgent
  with PageskinAdAgent
  with InlineMerchandiseComponentAgent
  with AdSlotAgent
  with ExecutionContexts
  with Logging {

  override protected val isProd: Boolean = environment.isProd
  override protected val isPreview: Boolean = {
    if (Play.maybeApplication.isDefined) environment.isPreview
    else false
  }

  private lazy val currentPaidForTagsAgent = AkkaAgent[Seq[PaidForTag]](Nil)
  private lazy val allAdFeatureTagsAgent = AkkaAgent[Seq[PaidForTag]](Nil)
  private lazy val tagToSponsorsMapAgent = AkkaAgent[Map[String, Set[String]]](Map[String, Set[String]]())
  private lazy val tagToAdvertisementFeatureSponsorsMapAgent = AkkaAgent[Map[String, Set[String]]](Map[String, Set[String]]())
  private lazy val inlineMerchandisingTagsAgent = AkkaAgent[InlineMerchandisingTagSet](InlineMerchandisingTagSet())
  private lazy val pageskinnedAdUnitAgent = AkkaAgent[Seq[PageSkinSponsorship]](Nil)
  private lazy val topAboveNavLineItemAgent = AkkaAgent[Seq[GuLineItem]](Nil)
  private lazy val topBelowNavLineItemAgent = AkkaAgent[Seq[GuLineItem]](Nil)
  private lazy val takeoverWithEmptyMPUsAgent = AkkaAgent[Seq[TakeoverWithEmptyMPUs]](Nil)

  protected def currentPaidForTags: Seq[PaidForTag] = currentPaidForTagsAgent get()
  protected def allAdFeatureTags: Seq[PaidForTag] = allAdFeatureTagsAgent get()
  protected def tagToSponsorsMap = tagToSponsorsMapAgent get()
  protected def tagToAdvertisementFeatureSponsorsMap = tagToAdvertisementFeatureSponsorsMapAgent get()
  protected def inlineMerchandisingTargetedTags: InlineMerchandisingTagSet = inlineMerchandisingTagsAgent get()
  protected def pageSkinSponsorships: Seq[PageSkinSponsorship] = pageskinnedAdUnitAgent get()
  protected def topAboveNavLineItems: Seq[GuLineItem] = topAboveNavLineItemAgent get()
  protected def topBelowNavLineItems: Seq[GuLineItem] = topBelowNavLineItemAgent get()
  protected def takeoversWithEmptyMPUs: Seq[TakeoverWithEmptyMPUs] =
    takeoverWithEmptyMPUsAgent get()

  def generateTagToSponsorsMap(paidForTags: Seq[PaidForTag]): Map[String, Set[String]] = {
    paidForTags.foldLeft(Map.empty[String, Set[String]]) { (soFar, tag) =>
      val tagSponsors = (for {
        sponsor <- tag.lineItems.flatMap(_.sponsor).headOption
      } yield {
        tag.targetedName -> (soFar.getOrElse(tag.targetedName, Set.empty[String]) + sponsor)
      }).toMap

      soFar ++ tagSponsors
    }
  }

  private def stringFromS3(key: String): Option[String] = S3.get(key)(UTF8)

  private def grabCurrentLineItemsFromStore(key: String): Seq[GuLineItem] = {
    val maybeLineItems = for (jsonString <- stringFromS3(key)) yield {
      Json.parse(jsonString).as[LineItemReport].lineItems
    }
    maybeLineItems getOrElse Nil
  }

  private def update[T](agent: Agent[Seq[T]])(freshData: => Seq[T]) {
    if (freshData.nonEmpty) {
      agent send freshData
    }
  }

  def refresh() {

    def grabPaidForTagsFromStore(key: String): Seq[PaidForTag] = {
      val reportOption: Option[PaidForTagsReport] = for {
        jsonString <- stringFromS3(key)
        report <- Json.parse(jsonString).asOpt[PaidForTagsReport]
      } yield report

      reportOption.fold(Seq[PaidForTag]())(_.paidForTags)
    }

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

    def updateMap(agent: Agent[Map[String, Set[String]]])(freshData: => Map[String, Set[String]]) {
      if (freshData.nonEmpty) {
        agent send freshData
      }
    }

    def updateInlineMerchandisingTargetedTags(freshData: InlineMerchandisingTagSet) {
      inlineMerchandisingTagsAgent sendOff { oldData =>
        if (freshData.nonEmpty) freshData else oldData
      }
    }

    val paidForTags: Seq[PaidForTag] = grabPaidForTagsFromStore(dfpPaidForTagsDataKey)
    update(currentPaidForTagsAgent)(paidForTags)

    update(allAdFeatureTagsAgent)(grabPaidForTagsFromStore(dfpAdFeatureReportKey))

    updateMap(tagToSponsorsMapAgent) {
      generateTagToSponsorsMap(paidForTags filter (_.paidForType == Sponsored))
    }

    updateMap(tagToAdvertisementFeatureSponsorsMapAgent) {
      generateTagToSponsorsMap(paidForTags filter (_.paidForType == AdvertisementFeature))
    }

    update(pageskinnedAdUnitAgent)(grabPageSkinSponsorshipsFromStore(dfpPageSkinnedAdUnitsKey))

    updateInlineMerchandisingTargetedTags(grabInlineMerchandisingTargetedTagsFromStore())
  }

  def refreshFaciaSpecificData(): Unit = {

    val currentLineItemsFromStore: Seq[GuLineItem] = grabCurrentLineItemsFromStore(dfpLineItemsKey)

    update(topAboveNavLineItemAgent) {
      val lineItems = currentLineItemsFromStore filter { lineItem =>
        lineItem.costType == "CPD" &&
          lineItem.targeting.adUnits.exists { adUnit =>
            val prefix = adUnit.path.mkString("/").stripSuffix("/ng").stripSuffix("/front")
            prefix.endsWith("/uk") || prefix.endsWith("/us") || prefix.endsWith("/au")
          } &&
          lineItem.targeting.geoTargetsIncluded.exists { geoTarget =>
            geoTarget.locationType == "COUNTRY" && (
              geoTarget.name == "United Kingdom" ||
                geoTarget.name == "United States" ||
                geoTarget.name == "Australia"
              )
          } &&
          lineItem.creativeSizes.exists { size =>
            size == leaderboardSize || size == responsiveSize
          }
      }

      log.info(s"Fetched line items for network front top-above-nav ad slots: ${
        lineItems.map(_.id).mkString(", ")
      }")

      lineItems
    }

    update(topBelowNavLineItemAgent) {
      currentLineItemsFromStore filter {
        _.targeting.customTargetSets.exists(_.targets.exists(_.isSlot("top-below-nav")))
      }
    }

    update(takeoverWithEmptyMPUsAgent)(TakeoverWithEmptyMPUs.fetch())
  }
}
