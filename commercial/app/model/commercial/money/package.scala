package model.commercial

import common.{ExecutionContexts, Logging}
import conf.CommercialConfiguration
import conf.switches.Switches._

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.xml.Elem

package object money {

  trait MoneySupermarketFeed[T] extends ExecutionContexts with Logging {

    protected val adTypeName: String

    protected val path: String

    final protected val maybeUrl = {

      // this tracking code appears in the links to products
      val trackingCode = "GU15"

      CommercialConfiguration.getProperty("moneysupermarket.api.url") map {
        base => s"$base/bestbuys/$path/$trackingCode"
      }
    }

    protected def parse(xml: Elem): Seq[T]

    protected def cleanResponseBody(body: String): String = body

    def loadAds(): Future[Seq[T]] = {
      maybeUrl map { url =>
        val request = FeedRequest(
          feedName = adTypeName,
          switch = MoneysupermarketFeedsSwitch,
          url = url,
          timeout = 10.seconds
        )
        FeedReader.readSeqFromXml[T](request)(parse)
      } getOrElse{
        log.warn(s"Missing URL for $adTypeName feed")
        Future.failed(FeedMissingConfigurationException(adTypeName))
      }
    }
  }


  trait MoneyAgent[T] extends MerchandiseAgent[T] with ExecutionContexts {

    protected def loadProducts(): Future[Seq[T]]

    def refresh(): Unit = {
      for {
        products <- loadProducts()
      } updateAvailableMerchandise(products)
    }
  }

}
