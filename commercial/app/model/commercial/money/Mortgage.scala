package model.commercial.money

import common.{ExecutionContexts, Logging}
import conf.CommercialConfiguration
import conf.Switches._
import model.commercial._

import scala.concurrent.Future
import scala.xml.{Elem, XML}

case class Mortgage(lender: String,
                    rate: String,
                    description: String,
                    overallCost: Double,
                    detailsUrl: String)
  extends Ad {

  def isTargetedAt(segment: Segment): Boolean = true
}


object MortgagesApi extends ExecutionContexts with Logging {

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

  def loadAds(): Future[Seq[Mortgage]] = {
    url map { u =>
      val result = FeedReader.read(FeedRequest(LCMortgageFeedSwitch, u)) { body =>
        val xml = XML.loadString(body)
        parse(xml)
      }
      result map {
        case Left(FeedReadWarning(message)) =>
          log.warn(s"Reading Mortgages feed failed: $message")
          Nil
        case Left(FeedReadException(message)) =>
          log.error(s"Reading Mortgages feed failed: $message")
          Nil
        case Right(jobs) => jobs
        case other =>
          log.error(s"Something unexpected has happened: $other")
          Nil
      }
    } getOrElse {
      log.warn("Reading Mortgages feed failed: missing URL")
      Future.successful(Nil)
    }
  }
}


object MortgagesAgent extends MoneyAgent[Mortgage] {
  protected def loadProducts() = MortgagesApi.loadAds()
}
