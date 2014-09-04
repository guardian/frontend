package dfp

import java.net.URLDecoder

import akka.agent.Agent
import common._
import conf.Configuration
import conf.Configuration.commercial.{dfpAdUnitRoot, dfpAdvertisementFeatureTagsDataKey, dfpInlineMerchandisingTagsDataKey, dfpPageSkinnedAdUnitsKey, dfpSponsoredTagsDataKey}
import model.{Config, Tag}
import play.api.{Application, GlobalSettings}
import services.S3

import scala.io.Codec.UTF8

trait DfpAgent {

  protected def sponsorships: Seq[Sponsorship]
  protected def advertisementFeatureSponsorships: Seq[Sponsorship]
  protected def inlineMerchandisingTargetedTags: InlineMerchandisingTagSet
  protected def pageSkinSponsorships: Seq[PageSkinSponsorship]

  private def containerSponsoredTag(config: Config, p: String => Boolean): Option[String] = {
    config.contentApiQuery.flatMap { encodedQuery =>
      val query = URLDecoder.decode(encodedQuery, "utf-8")
      val tokens = query.split( """\?|&|=|\(|\)|\||\,""").map(_.replaceFirst(".*/", ""))
      tokens find p
    }
  }

  private def isSponsoredContainer(config: Config, p: String => Boolean): Boolean = {
    containerSponsoredTag(config, p).isDefined
  }

  private def getKeywordTags(tags: Seq[Tag]): Seq[Tag] = tags filter(_.isKeyword)
  private def getKeywordOrSeriesTags(tags: Seq[Tag]): Seq[Tag] = tags.filter(t => t.isSeries || t.isKeyword)

  def isSponsored(tags: Seq[Tag]): Boolean = getKeywordOrSeriesTags(tags) exists (tag => isSponsored(tag.id))
  def isSponsored(tagId: String): Boolean = sponsorships exists (_.hasTag(tagId))
  def isSponsored(config: Config): Boolean = isSponsoredContainer(config, isSponsored)

  def isAdvertisementFeature(tags: Seq[Tag]): Boolean = getKeywordTags(tags) exists (tag => isAdvertisementFeature(tag.id))
  def isAdvertisementFeature(tagId: String): Boolean = advertisementFeatureSponsorships exists (_.hasTag(tagId))
  def isAdvertisementFeature(config: Config): Boolean = isSponsoredContainer(config, isAdvertisementFeature)

  def isProd = !Configuration.environment.isNonProd

  def hasInlineMerchandise(tags: Seq[Tag]): Boolean = tags exists inlineMerchandisingTargetedTags.hasTag

  def isPageSkinned(adUnitWithoutRoot: String, edition: Edition): Boolean = {
    if (adUnitWithoutRoot endsWith "front") {
      val adUnitWithRoot: String = s"$dfpAdUnitRoot/$adUnitWithoutRoot"

      def targetsAdUnitAndMatchesTheEdition(sponsorship: PageSkinSponsorship) = {
        sponsorship.adUnits.contains(adUnitWithRoot) &&
          (sponsorship.countries.isEmpty || sponsorship.countries.exists(_.editionId == edition.id))
      }

      if (isProd) {
        pageSkinSponsorships.exists { sponsorship =>
          targetsAdUnitAndMatchesTheEdition(sponsorship) && !sponsorship.targetsAdTest
        }
      } else {
        pageSkinSponsorships.exists { sponsorship =>
          targetsAdUnitAndMatchesTheEdition(sponsorship)
        }
      }
    } else {
      false
    }
  }

  def sponsorshipTag(config: Config): Option[String] = {
    containerSponsoredTag(config, isSponsored) orElse containerSponsoredTag(config, isAdvertisementFeature)
  }

  def getSponsor(tags: Seq[Tag]): Option[String] = tags.flatMap(tag => getSponsor(tag.id)).headOption

  def getSponsor(tagId: String): Option[String] = {
    def sponsorOf(sponsorships: Seq[Sponsorship]) = sponsorships.find(_.hasTag(tagId)).flatMap(_.sponsor)
    sponsorOf(sponsorships) orElse sponsorOf(advertisementFeatureSponsorships)
  }

  def getSponsor(config: Config): Option[String] = {
    for {
      tagId <- sponsorshipTag(config)
      sponsor <- getSponsor(tagId)
    } yield sponsor
  }
}


object DfpAgent extends DfpAgent with ExecutionContexts {

  private lazy val sponsoredTagsAgent = AkkaAgent[Seq[Sponsorship]](Nil)
  private lazy val advertisementFeatureTagsAgent = AkkaAgent[Seq[Sponsorship]](Nil)
  private lazy val inlineMerchandisingTagsAgent = AkkaAgent[InlineMerchandisingTagSet](InlineMerchandisingTagSet())
  private lazy val pageskinnedAdUnitAgent = AkkaAgent[Seq[PageSkinSponsorship]](Nil)

  protected def sponsorships: Seq[Sponsorship] = sponsoredTagsAgent get()
  protected def advertisementFeatureSponsorships: Seq[Sponsorship] = advertisementFeatureTagsAgent get()
  protected def inlineMerchandisingTargetedTags: InlineMerchandisingTagSet = inlineMerchandisingTagsAgent get()
  protected def pageSkinSponsorships: Seq[PageSkinSponsorship] = pageskinnedAdUnitAgent get()

  def refresh() {

    def stringFromS3(key: String): Option[String] = S3.get(key)(UTF8)

    def grabSponsorshipsFromStore(key: String): Seq[Sponsorship] = {
      val reportOption: Option[SponsorshipReport] = for {
        jsonString <- stringFromS3(key)
        report <- SponsorshipReportParser(jsonString)
      } yield report

      reportOption.fold(Seq[Sponsorship]())(_.sponsorships)
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
      agent sendOff { oldData =>
        if (freshData.nonEmpty) {
          freshData
        } else {
          oldData
        }
      }
    }

    def updateInlineMerchandisingTargetedTags(freshData: InlineMerchandisingTagSet) {
      inlineMerchandisingTagsAgent sendOff { oldData =>
        if (freshData.nonEmpty) freshData else oldData
      }
    }

    update(sponsoredTagsAgent, grabSponsorshipsFromStore(dfpSponsoredTagsDataKey))
    update(advertisementFeatureTagsAgent, grabSponsorshipsFromStore(dfpAdvertisementFeatureTagsDataKey))
    update(pageskinnedAdUnitAgent, grabPageSkinSponsorshipsFromStore(dfpPageSkinnedAdUnitsKey))
    updateInlineMerchandisingTargetedTags(grabInlineMerchandisingTargetedTagsFromStore())
  }
}


trait DfpAgentLifecycle extends GlobalSettings {

  override def onStart(app: Application) {
    super.onStart(app)

    Jobs.deschedule("DfpDataRefreshJob")
    Jobs.schedule("DfpDataRefreshJob", "0 6/5 * * * ?") {
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
