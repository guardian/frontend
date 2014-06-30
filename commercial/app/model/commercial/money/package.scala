package model.commercial

import conf.{Switches, CommercialConfiguration}
import common.ExecutionContexts
import scala.concurrent.Future

package object money {

  trait MoneySupermarketApi[T <: Ad] extends XmlAdsApi[T] {

    protected val switch = Switches.MoneysupermarketFeedsSwitch

    protected val path: String

    final protected val url = {

      // this tracking code appears in the links to products
      val trackingCode = "GU15"

      CommercialConfiguration.getProperty("moneysupermarket.api.url") map {
        base => s"$base/bestbuys/$path/$trackingCode"
      }
    }

    override protected val loadTimeout = 10000
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
