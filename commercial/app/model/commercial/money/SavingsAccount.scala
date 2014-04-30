package model.commercial.money

import model.commercial.{Segment, Ad}
import scala.xml.Elem

case class SavingsAccount(
                           provider: String,
                           name: String,
                           interestRate: Double,
                           interestPaid: String,
                           logoUrl: String,
                           applyUrl: String,
                           noticeTerm: String,
                           minimumInvestment: Int,
                           access: Map[String, Boolean])
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
          (product \ "InterestPaid").text,
          (product \ "LogoUrl").text,
          (product \ "ApplyUrl").text,
          (product \ "NoticeTerm").text,
          (product \ "MinimumInvestment").text.toInt,
          Map(
            ("Branch", (product \ "AccessBranch").text.toBoolean),
            ("Internet", (product \ "AccessInternet").text.toBoolean),
            ("Telephone", (product \ "AccessTelephone").text.toBoolean),
            ("Post", (product \ "AccessPost").text.toBoolean),
            ("Cash point", (product \ "AccessCashPoint").text.toBoolean)
          )
        )
    }
  }
}


object SavingsAgent extends MoneyAgent[SavingsAccount] {
  protected def loadProducts() = SavingsApi.loadAds()
}
