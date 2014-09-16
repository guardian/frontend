package model.commercial

import common.{ExecutionContexts, Logging}
import conf.CommercialConfiguration
import conf.Switches._
import model.commercial.money.MortgagesApi._

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.xml.{Elem, XML}

package object money {

  trait MoneySupermarketApi[T <: Ad] extends Logging {

    protected val adTypeName: String

    protected val path: String

    final protected val url = {

      // this tracking code appears in the links to products
      val trackingCode = "GU15"

      CommercialConfiguration.getProperty("moneysupermarket.api.url") map {
        base => s"$base/bestbuys/$path/$trackingCode"
      }
    }

    protected def parse(xml: Elem): Seq[T]

    protected def cleanResponseBody(body: String): String = body

    def loadAds(): Future[Seq[T]] = {
      FeedReader.readSeqFromXml[T](FeedRequest(adTypeName, MoneysupermarketFeedsSwitch, url, timeout = 10.seconds))(parse)
    }
  }


  trait MoneyAgent[T <: Ad] extends AdAgent[T] with ExecutionContexts {

    protected def loadProducts(): Future[Seq[T]]

    def refresh() {
      for {
        products <- loadProducts()
      } updateCurrentAds(products)
    }
  }

}
