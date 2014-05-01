package model.commercial.money

import model.commercial.{Segment, Ad}
import scala.xml.{Node, Elem}

object CreditCards {

  def currentAds: Map[String, Seq[CreditCard]] = Map(
    "balance-transfer" -> creditCardsAgent.BalanceTransferAndPurchase.currentAds,
    "purchases" -> creditCardsAgent.Purchase.currentAds,
    "balance-transfer-and-purchases" -> creditCardsAgent.BalanceTransfer.currentAds,
    "cashback" -> creditCardsAgent.Cashback.currentAds,
    "low-standard-rate" -> creditCardsAgent.LowStandardRate.currentAds,
    "rewards" -> creditCardsAgent.Rewards.currentAds,
    "bad-credit" -> creditCardsAgent.LowCredit.currentAds
  )

}

case class CreditCard(name: String,
                      provider: String,
                      balanceTransferRate: Double,
                      balanceTransferRateDuration: Int,
                      balanceTransferFee: Double,
                      example: CreditExample,
                      logoUrl: String,
                      applyUrl: String,
                      rewardNotes: String,
                      representativeApr: Double,
                      purchaseRate: Double,
                      purchaseRateDuration: Int) extends Ad {

  def isTargetedAt(segment: Segment): Boolean = true
}


case class CreditExample(amount: Double,
                         interestRate: Double,
                         interestRateDescription: String,
                         interestRateFixed: Boolean,
                         apr: Double,
                         aprFixed: Boolean,
                         fee: Double)


trait CreditCardsApi extends MoneySupermarketApi[CreditCard] {

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
          (product \ "BalanceTransferFee").text.toDouble,
          parseCreditExample(product),
          (product \ "LogoUrl").text,
          (product \ "ApplyUrl").text,
          (product \ "RewardNotes").text,
          (product \ "RepresentiveApr").text.toDouble,
          (product \ "PurchaseRate").text.toDouble,
          (product \ "PurchaseRateDuration").text.toInt
        )
    }
  }
}

package object creditCardsApi {

  object BalanceTransfer extends CreditCardsApi {
    protected val adTypeName = "Credit Cards - Balance Transfer"
    protected lazy val path = "cards/balance-transfer"
  }
  object Purchase extends CreditCardsApi {
    protected val adTypeName = "Credit Cards - Purchase"
    protected lazy val path = "cards/purchase"
  }
  object BalanceTransferAndPurchase extends CreditCardsApi {
    protected val adTypeName = "Credit Cards - Balance Transfer and Purchase"
    protected lazy val path = "cards/balance-transfer-and-purchase"
  }
  object Cashback extends CreditCardsApi {
    protected val adTypeName = "Credit Cards - Cashback"
    protected lazy val path = "cards/cashback"
  }
  object LowStandardRate extends CreditCardsApi {
    protected val adTypeName = "Credit Cards - Low Standard Rate"
    protected lazy val path = "cards/low-standard-rate"
  }
  object Rewards extends CreditCardsApi {
    protected val adTypeName = "Credit Cards - Rewards"
    protected lazy val path = "cards/rewards"
  }
  object LowCredit extends CreditCardsApi {
    protected val adTypeName = "Credit Cards - Low Credit"
    protected lazy val path = "cards/low-credit"
  }

}


package object creditCardsAgent {

  object BalanceTransfer extends MoneyAgent[CreditCard] {
    protected def loadProducts() = creditCardsApi.BalanceTransfer.loadAds()
  }
  object Purchase extends MoneyAgent[CreditCard] {
    protected def loadProducts() = creditCardsApi.Purchase.loadAds()
  }
  object BalanceTransferAndPurchase extends MoneyAgent[CreditCard] {
    protected def loadProducts() = creditCardsApi.BalanceTransferAndPurchase.loadAds()
  }
  object Cashback extends MoneyAgent[CreditCard] {
    protected def loadProducts() = creditCardsApi.Cashback.loadAds()
  }
  object LowStandardRate extends MoneyAgent[CreditCard] {
    protected def loadProducts() = creditCardsApi.LowStandardRate.loadAds()
  }
  object Rewards extends MoneyAgent[CreditCard] {
    protected def loadProducts() = creditCardsApi.Rewards.loadAds()
  }
  object LowCredit extends MoneyAgent[CreditCard] {
    protected def loadProducts() = creditCardsApi.LowCredit.loadAds()
  }

}
