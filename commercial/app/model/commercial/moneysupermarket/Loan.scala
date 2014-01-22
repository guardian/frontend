package model.commercial.moneysupermarket

import model.commercial.{Segment, Ad}
import scala.xml.{Node, Elem}

case class Loan(name: String,
                comments: String,
                headlineApr: Double,
                apr: Double,
                minAdvance: Double,
                maxAdvance: Double,
                example: RepresentativeExample,
                logoUrl: String,
                detailsUrl: String,
                index: Int
                 ) extends Ad {

  def isTargetedAt(segment: Segment): Boolean = true
}


case class RepresentativeExample(amount: Double,
                                 duration: Int,
                                 monthlyPayment: Double,
                                 totalChargeForCredit: Double,
                                 totalAmountPayable: Double,
                                 interestRate: Double)


object LoansApi extends MoneySupermarketApi[Loan] {

  protected val adTypeName = "Loans"

  protected lazy val path = "loans"

  def parse(xml: Elem): Seq[Loan] = {

    def parseRepresentativeExample(product: Node): RepresentativeExample = {
      RepresentativeExample(
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
          (product \ "MinAdvance").text.toDouble,
          (product \ "MaxAdvance").text.toDouble,
          parseRepresentativeExample(product),
          (product \ "LogoUrl").text,
          (product \ "DetailsUrl").text,
          (product \ "OrderId").text.toInt
        )
    }
  }
}


object LoansAgent extends MoneysupermarketAgent[Loan] {
  protected def loadProducts() = LoansApi.loadAds()
}
