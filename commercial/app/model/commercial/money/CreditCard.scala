package model.commercial.money

import model.commercial.{Segment, Ad}
import scala.xml.{Node, Elem}


case class CreditCard(name: String,
                      provider: String,
                      balanceTransferRate: Double,
                      balanceTransferRateDuration: Int,
                      example: CreditExample,
                      logoUrl: String,
                      applyUrl: String) extends Ad {

  def isTargetedAt(segment: Segment): Boolean = true
}


case class CreditExample(amount: Double,
                         interestRate: Double,
                         interestRateDescription: String,
                         interestRateFixed: Boolean,
                         apr: Double,
                         aprFixed: Boolean,
                         fee: Double)


object CreditCardsApi extends MoneySupermarketApi[CreditCard] {

  protected val adTypeName = "Credit Cards"

  protected lazy val path = "cards/balance-transfer-and-purchase"

  def parse(xml: Elem): Seq[CreditCard] = {

    def parseCreditExample(product: Node) = {
      CreditExample(
        (product \ "AmountOfCredit").text.toDouble,
        (product \ "InterestRate").text.toDouble,
        (product \ "InterestRateDescription").text,
        (product \ "InterestRateIsFixedRate").text.toBoolean,
        (product \ "RepresentiveApr").text.toDouble,
        (product \ "RepresentiveAprIsFixedRate").text.toBoolean,
        (product \ "Fee").text.toDouble
      )
    }

    xml \ "Product" map {
      product =>
        CreditCard(
          (product \ "CardName").text,
          (product \ "ProviderName").text,
          (product \ "BalanceTransferRate").text.toDouble,
          (product \ "BalanceTransferRateDuration").text.toInt,
          parseCreditExample(product),
          (product \ "LogoUrl").text,
          (product \ "ApplyUrl").text
        )
    }
  }
}


object CreditCardsAgent extends MoneyAgent[CreditCard] {
  protected def loadProducts() = CreditCardsApi.loadAds()
}
