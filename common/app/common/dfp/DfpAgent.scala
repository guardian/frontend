package common.dfp

import common.Box
import conf.Configuration.commercial._
import conf.Configuration.environment
import play.api.libs.json.Json
import services.S3

import scala.concurrent.ExecutionContext
import scala.io.Codec.UTF8
import org.checkerframework.checker.units.qual.s

object DfpAgent extends PageskinAdAgent with LiveBlogTopSponsorshipAgent with SurveySponsorshipAgent {

  override protected val environmentIsProd: Boolean = environment.isProd

  private lazy val liveblogTopSponsorshipAgent = Box[Seq[LiveBlogTopSponsorship]](Nil)
  private lazy val surveyAdUnitAgent = Box[Seq[SurveySponsorship]](Nil)
  private lazy val pageskinnedAdUnitAgent = Box[Seq[PageSkinSponsorship]](Nil)
  private lazy val nonRefreshableLineItemsAgent = Box[Seq[Long]](Nil)
  private lazy val specialAdUnitsAgent = Box[Seq[(String, String)]](Nil)
  private lazy val customFieldsAgent = Box[Seq[GuCustomField]](Nil)

  protected def pageSkinSponsorships: Seq[PageSkinSponsorship] = pageskinnedAdUnitAgent.get()
  protected def liveBlogTopSponsorships: Seq[LiveBlogTopSponsorship] = liveblogTopSponsorshipAgent.get()
  protected def surveySponsorships: Seq[SurveySponsorship] = surveyAdUnitAgent.get()

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

    def grabLiveBlogTopSponsorshipsFromStore(): Seq[LiveBlogTopSponsorship] = {
      val reportOption: Option[LiveBlogTopSponsorshipReport] = for {
        jsonString <- stringFromS3(dfpLiveBlogTopSponsorshipDataKey)
        report <- LiveBlogTopSponsorshipReportParser(jsonString)
      } yield report

      reportOption.fold(Seq[LiveBlogTopSponsorship]())(_.sponsorships)
    }

    def grabSurveySponsorshipsFromStore(): Seq[SurveySponsorship] = {
      val reportOption: Option[SurveySponsorshipReport] = for {
        jsonString <- stringFromS3(dfpSurveySponsorshipDataKey)
        report <- SurveySponsorshipReportParser(jsonString)
      } yield report

      reportOption.fold(Seq[SurveySponsorship]())(_.sponsorships)
    }

    def grabNonRefreshableLineItemIdsFromStore() = {
      (for {
        jsonString <- stringFromS3(dfpNonRefreshableLineItemIdsKey)
        lineItemIds <- Json.parse(jsonString).validate[Seq[Long]].asOpt
      } yield lineItemIds) getOrElse Nil
    }

    def grabSpecialAdUnitsFromStore(): Seq[(String, String)] = {
      (for {
        jsonString <- stringFromS3(dfpSpecialAdUnitsKey)
        report <- Json.parse(jsonString).validate[Seq[(String, String)]].asOpt
      } yield report) getOrElse Nil
    }

    def grabCustomFieldsFromStore() = {
      (for {
        jsonString <- stringFromS3(dfpCustomFieldsKey)
        customFields <- Json.parse(jsonString).validate[Seq[GuCustomField]].asOpt
      } yield customFields) getOrElse Nil
    }
    update(pageskinnedAdUnitAgent)(grabPageSkinSponsorshipsFromStore(dfpPageSkinnedAdUnitsKey))

    update(nonRefreshableLineItemsAgent)(grabNonRefreshableLineItemIdsFromStore())

    update(liveblogTopSponsorshipAgent)(grabLiveBlogTopSponsorshipsFromStore())

    update(surveyAdUnitAgent)(grabSurveySponsorshipsFromStore())

    update(specialAdUnitsAgent)(grabSpecialAdUnitsFromStore())

    update(customFieldsAgent)(grabCustomFieldsFromStore())
  }
}
