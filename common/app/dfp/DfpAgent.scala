package dfp

import common._
import java.net.URLDecoder
import model.{Config, Content, Section, Tag}
import play.api.libs.json.Json._
import play.api.{Application, GlobalSettings}
import scala.io.Codec.UTF8
import services.S3
import conf.Configuration
import Configuration.commercial.{dfpAdvertisementFeatureTagsDataKey, dfpSponsoredTagsDataKey, dfpPageSkinnedAdUnitsKey, dfpAdUnitRoot}
import akka.agent.Agent

trait DfpAgent {

  protected def sponsoredTags: Seq[String]
  protected def advertisementFeatureTags: Seq[String]
  protected def pageskinnedAdUnits: Seq[String]

  private def lastPart(keywordId: String): String =  keywordId.split('/').takeRight(1)(0)

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

  def isSponsored(content: Content): Boolean = isSponsored(content.keywords ++ content.series)
  def isSponsored(section: Section): Boolean = isSponsored(section.id)
  def isSponsored(tags: Seq[Tag]): Boolean = tags.exists(keyword => isSponsored(keyword.id))
  def isSponsored(tagId: String): Boolean = sponsoredTags contains lastPart(tagId)
  def isSponsored(config: Config): Boolean = isSponsoredContainer(config, isSponsored)

  def isAdvertisementFeature(content: Content): Boolean = isAdvertisementFeature(content.keywords ++ content.series)
  def isAdvertisementFeature(section: Section): Boolean = isAdvertisementFeature(section.id)
  def isAdvertisementFeature(tags: Seq[Tag]): Boolean =
    tags.exists(keyword => isAdvertisementFeature(keyword.id))
  def isAdvertisementFeature(tagId: String): Boolean = advertisementFeatureTags contains lastPart(tagId)
  def isAdvertisementFeature(config: Config): Boolean = isSponsoredContainer(config, isAdvertisementFeature)

  def sponsorshipTag(config: Config): Option[String] = {
    containerSponsoredTags(config, isSponsored) orElse {
      containerSponsoredTags(config, isAdvertisementFeature)
    }
  }

  def isPageSkinned(adUnitWithoutRoot: String) = {
    val adUnitWithRoot: String = s"$dfpAdUnitRoot/$adUnitWithoutRoot"
    pageskinnedAdUnits contains adUnitWithRoot
  }
}


object DfpAgent extends DfpAgent with ExecutionContexts {

  private lazy val sponsoredTagsAgent = AkkaAgent[Seq[String]](Nil)
  private lazy val advertisementFeatureTagsAgent = AkkaAgent[Seq[String]](Nil)
  private lazy val pageskinnedAdUnitAgent = AkkaAgent[Seq[String]](Nil)

  protected def sponsoredTags: Seq[String] = sponsoredTagsAgent get()

  protected def advertisementFeatureTags: Seq[String] = advertisementFeatureTagsAgent get()

  protected def pageskinnedAdUnits: Seq[String] = pageskinnedAdUnitAgent get()

  def refresh() {

    def grabListFromStore(key: String): Seq[String] = {
      val json = S3.get(key)(UTF8) map parse
      json.fold(Seq[String]())(_.as[Seq[String]])
    }

    def update(agent: Agent[Seq[String]], key: String) = {
      agent sendOff { oldData =>
        val freshData = grabListFromStore(key)
        if (freshData.nonEmpty) {
          freshData
        } else {
          oldData
        }
      }
    }

    update(sponsoredTagsAgent, dfpSponsoredTagsDataKey)
    update(advertisementFeatureTagsAgent, dfpAdvertisementFeatureTagsDataKey)
    update(pageskinnedAdUnitAgent, dfpPageSkinnedAdUnitsKey)
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
