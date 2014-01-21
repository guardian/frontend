package model.commercial.moneysupermarket

import model.commercial.XmlAdsApi
import scala.xml.Elem
import scala.concurrent.Future
import conf.CommercialConfiguration

object EasyAccessApi extends XmlAdsApi[EasyAccessProduct] {

  protected val adTypeName = "Easy Access Products"

  private lazy val url = {
    val slotCode = "GU6"
    CommercialConfiguration.getProperty("moneysupermarket.api.url") map {
      base => s"$base/savings/easy-access/$slotCode"
    }
  }

  override protected val loadTimeout = 10000

  def parse(xml: Elem): Seq[EasyAccessProduct] = {
    xml \ "Product" map {
      product =>
        EasyAccessProduct(
          (product \ "ProviderName").text,
          (product \ "ProductName").text,
          (product \ "InterestRate").text.toDouble,
          (product \ "LogoUrl").text,
          (product \ "ApplyUrl").text
        )
    }
  }

  def getProducts: Future[Seq[EasyAccessProduct]] = loadAds(url)
}
