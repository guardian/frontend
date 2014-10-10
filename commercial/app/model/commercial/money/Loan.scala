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
                categoryName: String
                 )


case class LoanExample(amount: Double,
                       duration: Int,
                       monthlyPayment: Double,
                       totalChargeForCredit: Double,
                       totalAmountPayable: Double,
                       interestRate: Double)


object LoansApi extends MoneySupermarketApi[Loan] {

  protected val adTypeName = "Loans"

  protected lazy val path = "loans"

  def parse(xml: Elem): Seq[Loan] = {

    def parseLoanExample(product: Node) = {
      LoanExample(
        (product \ "LoanAmount").text.toDouble,
        (product \ "LoanDuration").text.toInt,
        (product \ "MonthlyPayment").text.toDouble,
        (product \ "TotalChargeForCredit").text.toDouble,
        (product \ "TotalAmountPayable").text.toDouble,
        (product \ "InterestRate").text.toDouble
      )
    }

    xml \ "Product" map {
      product =>
        Loan(
          (product \ "LoanName").text,
          (product \ "LoanComments").text,
          (product \ "HeadlineApr").text.toDouble,
          (product \ "Apr").text.toDouble,
          new BigDecimal((product \ "MinAdvance").text),
          new BigDecimal((product \ "MaxAdvance").text),
          parseLoanExample(product),
          (product \ "LogoUrl").text,
          (product \ "DetailsUrl").text,
          (product \ "ApplyUrl").text,
          (product \ "CategoryName").text
        )
    }
  }
}


object LoansAgent extends MoneyAgent[Loan] {
  protected def loadProducts() = LoansApi.loadAds()
}
