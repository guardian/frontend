package common.dfp

import play.api.mvc.RequestHeader
import model.{MetaData}
import model.DotcomContentType
import net.liftweb.json.Meta

trait SurveySponsorshipAgent {

  protected def surveySponsorships: Seq[SurveySponsorship]

  private[dfp] def findSponsorships(
      adUnitPath: String,
      metaData: MetaData,
      adtest: Option[String],
  ): Seq[SurveySponsorship] = {
    surveySponsorships.filter { sponsorship =>
      sponsorship.adUnits.exists(adUnit => adUnitPath.contains(adUnit)) && sponsorship.matchesTargetedAdTest(adtest)
    }
  }

  def hasSurveyAd(fullAdUnitPath: String, metadata: MetaData, request: RequestHeader): Boolean = {
    if (metadata.contentType == Some(DotcomContentType.Article) && metadata.hasSurveyAd(request)) {
      val adTest = request.getQueryString("adtest")

      findSponsorships(fullAdUnitPath, metadata, adTest).nonEmpty
    } else {
      false
    }
  }
}
