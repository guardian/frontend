package model.commercial.money

import model.commercial.{XmlAdsApi, Segment, Ad}
import scala.xml.Elem
import conf.{CommercialConfiguration, Switches}

case class Mortgage(lender: String,
                    rate: String,
                    description: String,
                    overallCost: Double,
                    detailsUrl: String)
  extends Ad {

  def isTargetedAt(segment: Segment): Boolean = true
}


object MortgagesApi extends XmlAdsApi[Mortgage] {

  protected val switch = Switches.LCMortgageFeedSwitch

  protected val adTypeName = "Mortgages"

  protected def url = CommercialConfiguration.getProperty("lc.mortgages.api.url")

  def parse(xml: Elem): Seq[Mortgage] = {
    xml \ "RefProducts" map {
      product =>
        Mortgage(
          (product \ "Lender").text,
          (product \ "Rate").text,
          (product \ "Description").text,
          (product \ "OverallCost").text.toDouble,
          (product \ "Link").text
        )
    }
  }
}


object MortgagesAgent extends MoneyAgent[Mortgage] {
  protected def loadProducts() = MortgagesApi.loadAds()
}
