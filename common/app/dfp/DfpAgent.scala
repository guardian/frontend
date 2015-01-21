package dfp

import akka.agent.Agent
import common._
import conf.Configuration.commercial._
import conf.Configuration.environment
import play.api.libs.json.Json
import play.api.{Play, Application, GlobalSettings}
import services.S3

import scala.io.Codec.UTF8

object DfpAgent
  extends PaidForTagAgent
  with PageskinAdAgent
  with InlineMerchandiseComponentAgent
  with ExecutionContexts {

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

  protected def currentPaidForTags: Seq[PaidForTag] = currentPaidForTagsAgent get()
  protected def allAdFeatureTags: Seq[PaidForTag] = allAdFeatureTagsAgent get()
  protected def tagToSponsorsMap = tagToSponsorsMapAgent get()
  protected def tagToAdvertisementFeatureSponsorsMap = tagToAdvertisementFeatureSponsorsMapAgent get()
  protected def inlineMerchandisingTargetedTags: InlineMerchandisingTagSet = inlineMerchandisingTagsAgent get()
  protected def pageSkinSponsorships: Seq[PageSkinSponsorship] = pageskinnedAdUnitAgent get()

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

  def refresh() {

    def stringFromS3(key: String): Option[String] = S3.get(key)(UTF8)

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

    def update[T](agent: Agent[Seq[T]], freshData: Seq[T]) {
      if (freshData.nonEmpty) {
        agent send freshData
      }
    }

    def updateMap(agent: Agent[Map[String, Set[String]]], freshData: Map[String, Set[String]]) {
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
    update(currentPaidForTagsAgent, paidForTags)

    val allAdFeatureTags: Seq[PaidForTag] = grabPaidForTagsFromStore(dfpAdFeatureReportKey)
    update(allAdFeatureTagsAgent, allAdFeatureTags)

    val sponsoredTags: Seq[PaidForTag] = paidForTags filter (_.paidForType == Sponsored)
    updateMap(tagToSponsorsMapAgent, generateTagToSponsorsMap(sponsoredTags))

    val advertisementFeatures: Seq[PaidForTag] = paidForTags filter(_.paidForType == AdvertisementFeature)
    updateMap(tagToAdvertisementFeatureSponsorsMapAgent, generateTagToSponsorsMap(advertisementFeatures))

    update(pageskinnedAdUnitAgent, grabPageSkinSponsorshipsFromStore(dfpPageSkinnedAdUnitsKey))
    updateInlineMerchandisingTargetedTags(grabInlineMerchandisingTargetedTagsFromStore())
  }
}


trait DfpAgentLifecycle extends GlobalSettings {

  override def onStart(app: Application) {
    super.onStart(app)

    Jobs.deschedule("DfpDataRefreshJob")
    Jobs.scheduleEveryNMinutes("DfpDataRefreshJob", 1) {
      DfpAgent.refresh()
    }

    AkkaAsync {
      DfpAgent.refresh()
    }
  }

  override def onStop(app: Application) {
    Jobs.deschedule("DfpDataRefreshJob")
    super.onStop(app)
  }
}
