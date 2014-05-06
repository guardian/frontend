package model.commercial.money

import model.commercial.{Segment, Ad}
import scala.xml.Elem

object SavingsAccounts {

  def currentAds: Map[String, Seq[SavingsAccount]] = Map(
    "cash-isas" -> savingsAgent.CashIsas.currentAds,
    "easy-access" -> savingsAgent.EasyAccess.currentAds,
    "fixed-rate-bonds" -> savingsAgent.FixedRateBonds.currentAds,
    "regular-savings" -> savingsAgent.RegularSavings.currentAds,
    "childrens-accounts" -> savingsAgent.ChildrensAccounts.currentAds,
    "notice-accounts" -> savingsAgent.NoticeAccounts.currentAds,
    "offshore-accounts" -> savingsAgent.OffshoreAccounts.currentAds
  )

}

case class SavingsAccount(
                           provider: String,
                           name: String,
                           interestRate: Double,
                           interestPaid: String,
                           logoUrl: String,
                           applyUrl: String,
                           noticeTerm: String,
                           minimumInvestment: Int,
                           transferIn: Boolean,
                           access: Map[String, Boolean])
  extends Ad {

  def isTargetedAt(segment: Segment): Boolean = true
}


trait SavingsApi extends MoneySupermarketApi[SavingsAccount] {

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
          (product \ "TransferIn").text.toBoolean,
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

package savingsApi {

  object CashIsas extends SavingsApi {
    protected val adTypeName = "Savings Accounts - Cash ISAs"
    protected lazy val path = "savings/cash-isas"
  }
  object EasyAccess extends SavingsApi {
    protected val adTypeName = "Savings Accounts - Easy Access"
    protected lazy val path = "savings/easy-access"
  }
  object FixedRateBonds extends SavingsApi {
    protected val adTypeName = "Savings Accounts - Fixed Rate Bonds"
    protected lazy val path = "savings/fixed-rate-bonds"
  }
  object RegularSavings extends SavingsApi {
    protected val adTypeName = "Savings Accounts - Regular Savings"
    protected lazy val path = "savings/regular-savings"
  }
  object ChildrensAccounts extends SavingsApi {
    protected val adTypeName = "Savings Accounts - Childrens Accounts"
    protected lazy val path = "savings/childrens-accounts"
  }
  object NoticeAccounts extends SavingsApi {
    protected val adTypeName = "Savings Accounts - Notice Accounts"
    protected lazy val path = "savings/notice-accounts"
  }
  object OffshoreAccounts extends SavingsApi {
    protected val adTypeName = "Savings Accounts - Offshore Accounts"
    protected lazy val path = "savings/offshore-accounts"
  }

}

package savingsAgent {

  object CashIsas extends MoneyAgent[SavingsAccount] {
    protected def loadProducts() = savingsApi.CashIsas.loadAds()
  }
  object EasyAccess extends MoneyAgent[SavingsAccount] {
    protected def loadProducts() = savingsApi.EasyAccess.loadAds()
  }
  object FixedRateBonds extends MoneyAgent[SavingsAccount] {
    protected def loadProducts() = savingsApi.FixedRateBonds.loadAds()
  }
  object RegularSavings extends MoneyAgent[SavingsAccount] {
    protected def loadProducts() = savingsApi.RegularSavings.loadAds()
  }
  object ChildrensAccounts extends MoneyAgent[SavingsAccount] {
    protected def loadProducts() = savingsApi.ChildrensAccounts.loadAds()
  }
  object NoticeAccounts extends MoneyAgent[SavingsAccount] {
    protected def loadProducts() = savingsApi.NoticeAccounts.loadAds()
  }
  object OffshoreAccounts extends MoneyAgent[SavingsAccount] {
    protected def loadProducts() = savingsApi.OffshoreAccounts.loadAds()
  }

}
