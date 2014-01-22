package model.commercial.moneysupermarket

import model.commercial.{Segment, Ad}
import scala.xml.Elem

case class EasyAccessProduct(
                              provider: String,
                              name: String,
                              interestRate: Double,
                              logoUrl: String,
                              applyUrl: String)
  extends Ad {

  def isTargetedAt(segment: Segment): Boolean = true
}


object EasyAccessApi extends MoneySupermarketApi[EasyAccessProduct] {

  protected val adTypeName = "Easy Access Products"

  protected lazy val path = "savings/easy-access"

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
}


object EasyAccessAgent extends MoneysupermarketAgent[EasyAccessProduct] {
  protected def loadProducts() = EasyAccessApi.loadAds()
}
