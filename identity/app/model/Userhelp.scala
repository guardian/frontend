package model

sealed trait Userhelp {
  val name: String
  val faq: String
  val email: String
}

case object IdentityUserhelp extends Userhelp {
  val name = "Account"
  val faq = "http://www.theguardian.com/help/identity-faq"
  val email = "userhelp@theguardian.com?subject=Account%20help"
}

case object MembershipUserhelp extends Userhelp {
  val name = "Membership"
  val faq = "https://membership.theguardian.com/help"
  val email = "membershipsupport@theguardian.com"
}

case object DigitalPackUserhelp extends Userhelp {
  val name = "Subscriptions"
  val faq = "https://www.theguardian.com/subscriber-direct/subscription-frequently-asked-questions"
  val email = "digitalpack@theguardian.com"
}
