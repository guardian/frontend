package model.commercial.moneysupermarket

import model.commercial.{Segment, Ad}

case class EasyAccessProduct(
                              provider: String,
                              name: String,
                              interestRate: Double,
                              logoUrl: String,
                              applyUrl: String)
  extends Ad {

  def isTargetedAt(segment: Segment): Boolean = true
}
