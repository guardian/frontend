package model.commercial.money

import java.math.BigDecimal

import scala.xml.{Elem, Node}

case class Loan(name: String,
                comments: String,
                headlineApr: Double,
                apr: Double,
                minAdvance: BigDecimal,
                maxAdvance: BigDecimal,
                example: LoanExample,
                logoUrl: String,
                detailsUrl: String,
                applyUrl: String,
                categoryName: String)

object Loan {
  def apply(xml: Node): Loan = Loan(
    (xml \ "LoanName").text,
    (xml \ "LoanComments").text,
    (xml \ "HeadlineApr").text.toDouble,
    (xml \ "Apr").text.toDouble,
    new BigDecimal((xml \ "MinAdvance").text),
    new BigDecimal((xml \ "MaxAdvance").text),
    LoanExample(xml),
    (xml \ "LogoUrl").text,
    (xml \ "DetailsUrl").text,
    (xml \ "ApplyUrl").text,
    (xml \ "CategoryName").text
  )
}


case class LoanExample(amount: Double,
                       duration: Int,
                       monthlyPayment: Double,
                       totalChargeForCredit: Double,
                       totalAmountPayable: Double,
                       interestRate: Double)

object LoanExample {
  def apply(xml: Node): LoanExample = LoanExample(
    (xml \ "LoanAmount").text.toDouble,
    (xml \ "LoanDuration").text.toInt,
    (xml \ "MonthlyPayment").text.toDouble,
    (xml \ "TotalChargeForCredit").text.toDouble,
    (xml \ "TotalAmountPayable").text.toDouble,
    (xml \ "InterestRate").text.toDouble
  )
}


object LoansFeed extends MoneySupermarketFeed[Loan] {

  protected val adTypeName = "Loans"

  protected lazy val path = "loans"

  def parse(xml: Elem): Seq[Loan] = xml \ "Product" map (Loan(_))
}


object LoansAgent extends MoneyAgent[Loan] {
  protected def loadProducts() = LoansFeed.loadAds()
}
