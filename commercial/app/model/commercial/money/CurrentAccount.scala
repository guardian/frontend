package model.commercial.money

import model.commercial.{Segment, Ad}
import scala.xml.{Node, Elem}

case class CurrentAccount(provider: String,
                          name: String,
                          interestRate: Double,
                          minimumBalance: Double,
                          overdraftRate: Double,
                          overdraftBuffer: Double,
                          logoUrl: String,
                          applyUrl: String,
                          rewardAmount: String,
                          access: Map[String, Boolean])
  extends Ad {

  def isTargetedAt(segment: Segment): Boolean = true
}


object CurrentAccountsApi extends MoneySupermarketApi[CurrentAccount] {

  protected val adTypeName = "Current Accounts"

  protected lazy val path = "currentaccounts/rewards"

  override def cleanResponseBody(body: String) = body.replace("&", "&amp;")

  def parse(xml: Elem): Seq[CurrentAccount] = {

    def parseInterestRate(node: Node) = {
      val text = node.text
      if (text.length == 0) 0.0 else text.toDouble
    }

    xml \ "Product" map {
      product =>
        CurrentAccount(
          (product \ "ProviderName").text,
          (product \ "AccountName").text,
          parseInterestRate((product \ "InterestRate").head),
          (product \ "MinimumBalance").text.toDouble,
          (product \ "OverdraftRate").text.toDouble,
          (product \ "OverdraftBuffer").text.toDouble,
          (product \ "LogoUrl").text.trim(),
          (product \ "ApplyUrl").text.trim(),
          (product \ "RewardAmount").text,
          Map(
            ("Branch", (product \ "AccessBranch").text.toBoolean),
            ("Post office", (product \ "AccessPostOffice").text.toBoolean),
            ("Online", (product \ "AccessOnline").text.toBoolean),
            ("Post", (product \ "AccessPost").text.toBoolean),
            ("Telephone", (product \ "AccessTelephone").text.toBoolean)
          )
        )
    }
  }
}


object CurrentAccountsAgent extends MoneyAgent[CurrentAccount] {
  protected def loadProducts() = CurrentAccountsApi.loadAds()
}
