package dfp

import java.net.URLDecoder

import akka.agent.Agent
import com.gu.facia.client.models.CollectionConfig
import common._
import conf.Configuration.commercial._
import conf.Configuration.environment
import model.Tag
import model.`package`.frontKeywordIds
import play.api.libs.json.Json
import play.api.{Application, GlobalSettings}
import services.S3

import scala.io.Codec.UTF8

trait DfpAgent {

  protected def allPaidForTags: Seq[PaidForTag]
  protected def sponsorships: Seq[PaidForTag]
  protected def tagToSponsorsMap: Map[String, Set[String]]
  protected def advertisementFeatureSponsorships: Seq[PaidForTag]
  protected def tagToAdvertisementFeatureSponsorsMap: Map[String, Set[String]]
  protected def foundationSupported: Seq[PaidForTag]
  protected def inlineMerchandisingTargetedTags: InlineMerchandisingTagSet
  protected def pageSkinSponsorships: Seq[PageSkinSponsorship]

  private def matches(tagId: String, targetedTagName: String): Boolean = {
    tagId.endsWith(s"/$targetedTagName")
  }

  private def containerSponsoredTag(config: CollectionConfig,
                                    p: String => Boolean): Option[String] = {
    val stopWords = Set("newest", "order-by", "published", "search", "tag", "use-date")

    config.apiQuery.flatMap { encodedQuery =>
      val query = URLDecoder.decode(encodedQuery, "utf-8")
      val tokens = query.split( """\?|&|=|\(|\)|\||\,""")
      val possibleKeywords = tokens filterNot stopWords.contains flatMap frontKeywordIds
      val keywords = possibleKeywords filter p
      keywords.headOption
    }
  }

  private def isSponsoredContainer(config: CollectionConfig, p: String => Boolean): Boolean = {
    containerSponsoredTag(config, p).isDefined
  }

  private def paidForTag(available: Seq[PaidForTag],
                         tags: Seq[Tag],
                         section: Option[String]): Option[Tag] = {
    sponsorshipTag(tags, section) match {
      case Some(capiTag) if available.exists { paidForTag =>
        matches(capiTag.id, paidForTag.targetedName)
      } => Some(capiTag)
      case _ => None
    }
  }

  private def isPaidFor(available: Seq[PaidForTag],
                        tags: Seq[Tag],
                        section: Option[String]): Boolean =
    paidForTag(available, tags, section).nonEmpty

  private def isPaidFor(available: Seq[PaidForTag],
                        tagId: String,
                        maybeSection: Option[String]): Boolean = {
    def sectionMatches(sectionId: String, paidForTagAdUnitPaths: Seq[Seq[String]]): Boolean = {
      paidForTagAdUnitPaths.isEmpty || paidForTagAdUnitPaths.exists { path =>
        path.tail.isEmpty || sectionId.startsWith(path.tail.head)
      }
    }
    available exists { tag =>
      matches(tagId, tag.targetedName) &&
        (maybeSection.isEmpty || maybeSection.exists { section =>
          val tagAdUnitPaths = tag.lineItems flatMap { lineItem =>
            lineItem.targeting.adUnits map (_.path)
          }
          sectionMatches(section, tagAdUnitPaths)
        })
    }
  }

  def isSponsored(tags: Seq[Tag], sectionId: Option[String]): Boolean = isPaidFor(sponsorships, tags, sectionId)

  def isSponsored(tagId: String, sectionId: Option[String]): Boolean = {
    isPaidFor(sponsorships, tagId, sectionId)
  }

  def isSponsored(config: CollectionConfig): Boolean = isSponsoredContainer(config, {isSponsored(_, None)})

  def hasMultipleSponsors(tags: Seq[Tag]): Boolean = {
    tags.map { tag =>
      tagToSponsorsMap.getOrElse(tag.id.split("/").last, Seq[String]())
    }.flatten.toSeq.size > 1
  }

  def hasMultipleSponsors(tagId: String): Boolean = {
    (tagToSponsorsMap contains tagId) &&
      (tagToSponsorsMap(tagId).size > 1)
  }

  def hasMultipleFeatureAdvertisers(tags: Seq[Tag]): Boolean = {
    tags.map { tag =>
      tagToAdvertisementFeatureSponsorsMap.getOrElse(tag.id.split("/").last, Seq[String]())
    }.flatten.toSeq.size > 1
  }

  def hasMultipleFeatureAdvertisers(tagId: String): Boolean = {
    (tagToAdvertisementFeatureSponsorsMap contains tagId) &&
      (tagToAdvertisementFeatureSponsorsMap(tagId).size > 1)
  }

  def isAdvertisementFeature(tags: Seq[Tag], sectionId: Option[String]): Boolean = {
    isPaidFor(advertisementFeatureSponsorships, tags, sectionId)
  }
  def isAdvertisementFeature(tagId: String, sectionId: Option[String]): Boolean = {
    isPaidFor(advertisementFeatureSponsorships, tagId, sectionId)
  }
  def isAdvertisementFeature(config: CollectionConfig): Boolean = isSponsoredContainer(config, {isAdvertisementFeature(_, None)})

  def isExpiredAdvertisementFeature(tags: Seq[Tag], sectionId: Option[String]): Boolean = {
    val contentTagNames = tags map (_.id.split("/").last)
    val matchingAdFeature = advertisementFeatureSponsorships find { adFeature =>
      contentTagNames contains adFeature.targetedName
    }
    val lineItems = matchingAdFeature map (_.lineItems) getOrElse Nil
    lineItems forall { lineItem =>
      lineItem.endTime exists (_.isBeforeNow)
    }
  }

  def isFoundationSupported(tags: Seq[Tag], sectionId: Option[String]): Boolean = isPaidFor(foundationSupported, tags, sectionId)
  def isFoundationSupported(tagId: String, sectionId: Option[String]): Boolean = isPaidFor(foundationSupported, tagId, sectionId)
  def isFoundationSupported(config: CollectionConfig): Boolean = isSponsoredContainer(config, {isFoundationSupported(_, None)})

  def isProd = environment.isProd

  def hasInlineMerchandise(tags: Seq[Tag]): Boolean = tags exists inlineMerchandisingTargetedTags.hasTag

  def isPageSkinned(adUnitWithoutRoot: String, edition: Edition): Boolean = {

    if (PageSkin.isValidForNextGenPageSkin(adUnitWithoutRoot)) {
      val adUnitWithRoot: String = s"$dfpAdUnitRoot/$adUnitWithoutRoot"

      def targetsAdUnitAndMatchesTheEdition(sponsorship: PageSkinSponsorship) = {
        val adUnits = sponsorship.adUnits map (_.stripSuffix("/ng"))
        adUnits.contains(adUnitWithRoot) &&
          sponsorship.editions.contains(edition) &&
          !sponsorship.isR2Only
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

  def sponsorshipTag(config: CollectionConfig): Option[String] = {
    containerSponsoredTag(config, {isSponsored(_, None)}) orElse
      containerSponsoredTag(config, {isAdvertisementFeature(_, None)}) orElse
      containerSponsoredTag(config, {isFoundationSupported(_, None)})
  }

  def getSponsor(tags: Seq[Tag]): Option[String] = tags.flatMap(tag => getSponsor(tag.id))
    .headOption

  def getSponsor(tagId: String): Option[String] = {
    def sponsorOf(paidForTags: Seq[PaidForTag]) = {
      val maybeTag = paidForTags.find(t => matches(tagId, t.targetedName))
      maybeTag.flatMap(_.lineItems.flatMap(_.sponsor).headOption)
    }
    sponsorOf(sponsorships) orElse sponsorOf(advertisementFeatureSponsorships) orElse sponsorOf(foundationSupported)
  }

  def getSponsor(config: CollectionConfig): Option[String] = {
    for {
      tagId <- sponsorshipTag(config)
      sponsor <- getSponsor(tagId)
    } yield sponsor
  }

  def sponsorshipType(config: CollectionConfig): Option[String] = {
    if (isSponsored(config)) {
      Option("sponsoredfeatures")
    } else if (isAdvertisementFeature(config)) {
      Option("advertisement-features")
    } else if (isFoundationSupported(config)) {
      Option("foundation-features")
    } else {
      None
    }
  }

  def sponsorshipTag(tags: Seq[Tag], sectionId: Option[String]): Option[Tag] = {
    val series = tags.filter(_.isSeries)
    val keywords = tags.filter(_.isKeyword)
    series.find(tag => isPaidFor(allPaidForTags, tag.id, sectionId)) orElse
      keywords.find(tag => isPaidFor(allPaidForTags, tag.id, sectionId))
  }

}


object DfpAgent extends DfpAgent with ExecutionContexts {

  private lazy val allPaidForTagsAgent = AkkaAgent[Seq[PaidForTag]](Nil)
  private lazy val sponsoredTagsAgent = AkkaAgent[Seq[PaidForTag]](Nil)
  private lazy val tagToSponsorsMapAgent = AkkaAgent[Map[String, Set[String]]](Map[String, Set[String]]())
  private lazy val advertisementFeatureTagsAgent = AkkaAgent[Seq[PaidForTag]](Nil)
  private lazy val tagToAdvertisementFeatureSponsorsMapAgent = AkkaAgent[Map[String, Set[String]]](Map[String, Set[String]]())
  private lazy val foundationSupportedTagsAgent = AkkaAgent[Seq[PaidForTag]](Nil)
  private lazy val inlineMerchandisingTagsAgent = AkkaAgent[InlineMerchandisingTagSet](InlineMerchandisingTagSet())
  private lazy val pageskinnedAdUnitAgent = AkkaAgent[Seq[PageSkinSponsorship]](Nil)

  protected def allPaidForTags: Seq[PaidForTag] = allPaidForTagsAgent get()
  protected def sponsorships: Seq[PaidForTag] = sponsoredTagsAgent get()
  protected def tagToSponsorsMap = tagToSponsorsMapAgent get()
  protected def advertisementFeatureSponsorships: Seq[PaidForTag] = advertisementFeatureTagsAgent get()
  protected def tagToAdvertisementFeatureSponsorsMap = tagToAdvertisementFeatureSponsorsMapAgent get()
  protected def foundationSupported: Seq[PaidForTag] = foundationSupportedTagsAgent get()
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
    update(allPaidForTagsAgent, paidForTags)

    val sponsoredTags: Seq[PaidForTag] = paidForTags filter (_.paidForType == Sponsored)
    update(sponsoredTagsAgent, sponsoredTags)
    updateMap(tagToSponsorsMapAgent, generateTagToSponsorsMap(sponsoredTags))

    val advertisementFeatures: Seq[PaidForTag] = paidForTags filter(_.paidForType == AdvertisementFeature)
    update(advertisementFeatureTagsAgent, advertisementFeatures)
    updateMap(tagToAdvertisementFeatureSponsorsMapAgent, generateTagToSponsorsMap(advertisementFeatures))

    val foundationSupportedTags: Seq[PaidForTag] = paidForTags filter(_.paidForType == FoundationFunded)
    update(foundationSupportedTagsAgent, foundationSupportedTags)

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
