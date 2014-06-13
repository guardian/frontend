package dfp

import common._
import java.net.URLDecoder
import model.{Config, Content, Section, Tag}
import play.api.libs.json.Json._
import play.api.{Application, GlobalSettings}
import scala.io.Codec.UTF8
import services.S3
import conf.Configuration
import Configuration.commercial.{dfpAdvertisementFeatureKeywordsDataKey, dfpSponsoredKeywordsDataKey, dfpPageSkinnedAdUnitsKey, dfpAdUnitRoot}
import akka.agent.Agent

trait DfpAgent {

  protected def sponsoredKeywords: Seq[String]
  protected def advertisementFeatureKeywords: Seq[String]
  protected def pageskinnedAdUnits: Seq[String]

  private def lastPart(keywordId: String): String =  keywordId.split('/').takeRight(1)(0)

  private def containerSponsoredKeyword(config: Config, p: String => Boolean): Option[String] = {
    config.contentApiQuery.flatMap { encodedQuery =>
      val query = URLDecoder.decode(encodedQuery, "utf-8")
      val tokens = query.split( """\?|&|=|\(|\)|\||\,""").map(_.replaceFirst(".*/", ""))
      tokens find p
    }
  }

  private def isSponsoredContainer(config: Config, p: String => Boolean): Boolean = {
    containerSponsoredKeyword(config, p).isDefined
  }

  def isSponsored(content: Content): Boolean = isSponsored(content.keywords)
  def isSponsored(section: Section): Boolean = isSponsored(section.id)
  def isSponsored(keywords: Seq[Tag]): Boolean = keywords.exists(keyword => isSponsored(keyword.id))
  def isSponsored(keywordId: String): Boolean = sponsoredKeywords contains lastPart(keywordId)
  def isSponsored(config: Config): Boolean = isSponsoredContainer(config, isSponsored)

  def isAdvertisementFeature(content: Content): Boolean = isAdvertisementFeature(content.keywords)
  def isAdvertisementFeature(section: Section): Boolean = isAdvertisementFeature(section.id)
  def isAdvertisementFeature(keywords: Seq[Tag]): Boolean =
    keywords.exists(keyword => isAdvertisementFeature(keyword.id))
  def isAdvertisementFeature(keywordId: String): Boolean = advertisementFeatureKeywords contains lastPart(keywordId)
  def isAdvertisementFeature(config: Config): Boolean = isSponsoredContainer(config, isAdvertisementFeature)

  def sponsorshipKeyword(config: Config): Option[String] = {
    containerSponsoredKeyword(config, isSponsored) orElse {
      containerSponsoredKeyword(config, isAdvertisementFeature)
    }
  }

  def isPageSkinned(adUnitWithoutRoot: String) = {
    val adUnitWithRoot: String = s"$dfpAdUnitRoot/$adUnitWithoutRoot"
    pageskinnedAdUnits contains adUnitWithRoot
  }
}


object DfpAgent extends DfpAgent with ExecutionContexts {

  private lazy val sponsoredKeywordsAgent = AkkaAgent[Seq[String]](Nil)
  private lazy val advertisementFeatureKeywordsAgent = AkkaAgent[Seq[String]](Nil)
  private lazy val pageskinnedAdUnitAgent = AkkaAgent[Seq[String]](Nil)

  protected def sponsoredKeywords: Seq[String] = sponsoredKeywordsAgent get()

  protected def advertisementFeatureKeywords: Seq[String] = advertisementFeatureKeywordsAgent get()

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

    update(sponsoredKeywordsAgent, dfpSponsoredKeywordsDataKey)
    update(advertisementFeatureKeywordsAgent, dfpAdvertisementFeatureKeywordsDataKey)
    update(pageskinnedAdUnitAgent, dfpPageSkinnedAdUnitsKey)
  }

  def stop() {
    sponsoredKeywordsAgent close()
    advertisementFeatureKeywordsAgent close()
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
