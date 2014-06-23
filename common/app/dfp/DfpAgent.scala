package dfp

import java.net.URLDecoder

import akka.agent.Agent
import common._
import conf.Configuration.commercial.{dfpAdUnitRoot, dfpAdvertisementFeatureTagsDataKey, dfpPageSkinnedAdUnitsKey, dfpSponsoredTagsDataKey}
import model.{Config, Tag}
import play.api.libs.json.Json._
import play.api.{Application, GlobalSettings}
import services.S3

import scala.io.Codec.UTF8

trait DfpAgent {

  protected def sponsoredTags: Seq[Sponsorship]
  protected def advertisementFeatureTags: Seq[Sponsorship]
  protected def pageskinnedAdUnits: Seq[String]

  private def containerSponsoredTags(config: Config, p: String => Boolean): Option[String] = {
    config.contentApiQuery.flatMap { encodedQuery =>
      val query = URLDecoder.decode(encodedQuery, "utf-8")
      val tokens = query.split( """\?|&|=|\(|\)|\||\,""").map(_.replaceFirst(".*/", ""))
      tokens find p
    }
  }

  private def isSponsoredContainer(config: Config, p: String => Boolean): Boolean = {
    containerSponsoredTags(config, p).isDefined
  }

  def isSponsored(tags: Seq[Tag]): Boolean = tags.exists(keyword => isSponsored(keyword.id))
  def isSponsored(tagId: String): Boolean = sponsoredTags exists (_.hasTag(tagId))
  def isSponsored(config: Config): Boolean = isSponsoredContainer(config, isSponsored)

  def isAdvertisementFeature(tags: Seq[Tag]): Boolean = tags.exists(keyword => isAdvertisementFeature(keyword.id))
  def isAdvertisementFeature(tagId: String): Boolean = advertisementFeatureTags exists (_.hasTag(tagId))
  def isAdvertisementFeature(config: Config): Boolean = isSponsoredContainer(config, isAdvertisementFeature)

  def sponsorshipTag(config: Config): Option[String] = {
    containerSponsoredTags(config, isSponsored) orElse {
      containerSponsoredTags(config, isAdvertisementFeature)
    }
  }

  def getSponsor(tags: Seq[Tag]): Option[String] = {
    tags match {
      case head :: tail => getSponsor(head.id) orElse getSponsor(tail)
      case Nil => None
    }
  }

  def getSponsor(tagId: String): Option[String] = {
    def sponsor(tags: Seq[Sponsorship]) = tags.find(_.hasTag(tagId)).flatMap(_.sponsor)
    sponsor(sponsoredTags) orElse sponsor(advertisementFeatureTags)
  }

  def isPageSkinned(adUnitWithoutRoot: String) = {
    val adUnitWithRoot: String = s"$dfpAdUnitRoot/$adUnitWithoutRoot"
    pageskinnedAdUnits contains adUnitWithRoot
  }
}


object DfpAgent extends DfpAgent with ExecutionContexts {

  private lazy val sponsoredTagsAgent = AkkaAgent[Seq[Sponsorship]](Nil)
  private lazy val advertisementFeatureTagsAgent = AkkaAgent[Seq[Sponsorship]](Nil)
  private lazy val pageskinnedAdUnitAgent = AkkaAgent[Seq[String]](Nil)

  protected def sponsoredTags: Seq[Sponsorship] = sponsoredTagsAgent get()
  protected def advertisementFeatureTags: Seq[Sponsorship] = advertisementFeatureTagsAgent get()
  protected def pageskinnedAdUnits: Seq[String] = pageskinnedAdUnitAgent get()

  def refresh() {

    def stringFromS3(key: String) = S3.get(key)(UTF8)
    def json(key: String) =  stringFromS3(key) map parse

    def grabListFromStore(key: String): Seq[String] = {
      json(key).fold(Seq[String]())(_.as[Seq[String]])
    }

    def grabSponsorshipsFromStore(key: String): Seq[Sponsorship] = {
      val reportOption: Option[SponsorshipReport] = for {
        jsonString <- stringFromS3(key)
        report <- SponsorshipReportParser(jsonString)
      } yield report
      
      reportOption.fold(Seq[Sponsorship]())(_.sponsorships)
    }

    def update[T](agent: Agent[Seq[T]], freshData: Seq[T]) = {
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
    update(pageskinnedAdUnitAgent, grabListFromStore(dfpPageSkinnedAdUnitsKey))
  }

  def stop() {
    sponsoredTagsAgent close()
    advertisementFeatureTagsAgent close()
    pageskinnedAdUnitAgent close()
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
    DfpAgent.stop()

    super.onStop(app)
  }
}
