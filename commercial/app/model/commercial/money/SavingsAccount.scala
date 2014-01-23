package model.commercial.money

import model.commercial.{Segment, Ad}
import scala.xml.Elem

case class SavingsAccount(
                           provider: String,
                           name: String,
                           interestRate: Double,
                           logoUrl: String,
                           applyUrl: String)
  extends Ad {

  def isTargetedAt(segment: Segment): Boolean = true
}


object SavingsApi extends MoneySupermarketApi[SavingsAccount] {

  protected val adTypeName = "Savings Accounts"

  protected lazy val path = "savings/easy-access"

  def parse(xml: Elem): Seq[SavingsAccount] = {
    xml \ "Product" map {
      product =>
        SavingsAccount(
          (product \ "ProviderName").text,
          (product \ "ProductName").text,
          (product \ "InterestRate").text.toDouble,
          (product \ "LogoUrl").text,
          (product \ "ApplyUrl").text
        )
    }
  }
}


object SavingsAgent extends MoneyAgent[SavingsAccount] {
  protected def loadProducts() = SavingsApi.loadAds()
}
