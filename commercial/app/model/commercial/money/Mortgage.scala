package model.commercial.money

import common.{ExecutionContexts, Logging}
import conf.CommercialConfiguration
import conf.Switches._
import model.commercial._

import scala.concurrent.Future
import scala.xml.Elem

case class Mortgage(lender: String,
                    rate: String,
                    description: String,
                    overallCost: Double,
                    detailsUrl: String)


object MortgagesApi extends ExecutionContexts with Logging {

  private lazy val url = CommercialConfiguration.getProperty("lc.mortgages.api.url")

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

  def loadAds(): Future[Seq[Mortgage]] = {
    val request = FeedRequest(
      feedName = "Mortgages",
      switch = LCMortgageFeedSwitch,
      url = url
    )
    FeedReader.readSeqFromXml[Mortgage](request)(parse)
  }

}


object MortgagesAgent extends MoneyAgent[Mortgage] {
  protected def loadProducts() = MortgagesApi.loadAds()
}
