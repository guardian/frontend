package model.commercial.money

import common.{ExecutionContexts, Logging}
import conf.CommercialConfiguration
import conf.switches.Switches._
import model.commercial._

import scala.concurrent.Future
import scala.xml.Elem

case class Mortgage(lender: String,
                    rate: String,
                    description: String,
                    overallCost: Double,
                    detailsUrl: String)


object MortgagesFeed extends ExecutionContexts with Logging {

  private lazy val maybeUrl = CommercialConfiguration.getProperty("lc.mortgages.api.url")

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
    maybeUrl map { url =>
      val request = FeedRequest(
        feedName = "Mortgages",
        switch = LCMortgageFeedSwitch,
        url
      )
      FeedReader.readSeqFromXml[Mortgage](request)(parse)
    } getOrElse {
      log.warn("Missing URL for Mortgages feed")
      Future.failed(FeedMissingConfigurationException("Mortgages"))
    }
  }

}


object MortgagesAgent extends MoneyAgent[Mortgage] {
  protected def loadProducts() = MortgagesFeed.loadAds()
}
