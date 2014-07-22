package dfp

import java.net.URLDecoder

import akka.agent.Agent
import common._
import conf.Configuration.commercial.{dfpAdUnitRoot, dfpAdvertisementFeatureTagsDataKey, dfpPageSkinnedAdUnitsKey, dfpSponsoredTagsDataKey}
import model.{Config, Tag}
import play.api.{Application, GlobalSettings}
import services.S3

import scala.io.Codec.UTF8

trait DfpAgent {

  protected def sponsorships: Seq[Sponsorship]
  protected def advertisementFeatureSponsorships: Seq[Sponsorship]
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

  private def getPrimaryKeywordOrSeriesTag(tags: Seq[Tag]): Option[Tag] = tags find { tag =>
    tag.tagType == "keyword" || tag.tagType == "series"
  }

  def isSponsored(tags: Seq[Tag]): Boolean = getPrimaryKeywordOrSeriesTag(tags) exists (tag => isSponsored(tag.id))
  def isSponsored(tagId: String): Boolean = sponsorships exists (_.hasTag(tagId))
  def isSponsored(config: Config): Boolean = isSponsoredContainer(config, isSponsored)

  def isAdvertisementFeature(tags: Seq[Tag]): Boolean = getPrimaryKeywordOrSeriesTag(tags) exists (tag => isAdvertisementFeature(tag.id))
  def isAdvertisementFeature(tagId: String): Boolean = advertisementFeatureSponsorships exists (_.hasTag(tagId))
  def isAdvertisementFeature(config: Config): Boolean = isSponsoredContainer(config, isAdvertisementFeature)

  def isPageSkinned(adUnitWithoutRoot: String, edition: Edition): Boolean = {
    if (adUnitWithoutRoot endsWith "front") {
      val adUnitWithRoot: String = s"$dfpAdUnitRoot/$adUnitWithoutRoot"

      pageSkinSponsorships.exists { sponsorship =>
        sponsorship.adUnits.contains(adUnitWithRoot) &&
          (sponsorship.countries.isEmpty || sponsorship.countries.exists(_.editionId == edition.id))
      }
    } else {
      false
    }
  }

  def sponsorshipTag(config: Config): Option[String] = {
    containerSponsoredTag(config, isSponsored) orElse containerSponsoredTag(config, isAdvertisementFeature)
  }

  def getSponsor(tags: Seq[Tag]): Option[String] = getPrimaryKeywordOrSeriesTag(tags) flatMap (tag => getSponsor(tag.id))

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
  private lazy val pageskinnedAdUnitAgent = AkkaAgent[Seq[PageSkinSponsorship]](Nil)

  protected def sponsorships: Seq[Sponsorship] = sponsoredTagsAgent get()
  protected def advertisementFeatureSponsorships: Seq[Sponsorship] = advertisementFeatureTagsAgent get()
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

    def update[T](agent: Agent[Seq[T]], freshData: Seq[T]) {
      agent sendOff { oldData =>
        if (freshData.nonEmpty) {
          freshData
        } else {
          oldData
        }
      }
    }

    update(sponsoredTagsAgent, grabSponsorshipsFromStore(dfpSponsoredTagsDataKey))
    update(advertisementFeatureTagsAgent, grabSponsorshipsFromStore(dfpAdvertisementFeatureTagsDataKey))
    update(pageskinnedAdUnitAgent, grabPageSkinSponsorshipsFromStore(dfpPageSkinnedAdUnitsKey))
  }
}


trait DfpAgentLifecycle extends GlobalSettings {

  override def onStart(app: Application) {
    super.onStart(app)

    Jobs.deschedule("DfpDataRefreshJob")
    Jobs.schedule("DfpDataRefreshJob", "0 6/30 * * * ?") {
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
