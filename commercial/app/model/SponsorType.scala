package commercial

sealed abstract class SponsorType(val className: String)
case object PaidFor extends SponsorType("paidfor")
case object Supported extends SponsorType("supported")
