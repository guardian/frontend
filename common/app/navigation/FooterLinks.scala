package navigation

import common.{Edition, editions}


case class FooterLink(
  text: String,
  url: String,
  dataLinkName: String,
  extraClasses: String = ""
)

object FooterLinks {

  // Footer column one

  val complaintsAndCorrections = FooterLink("Complaints & corrections", "/info/complaints-and-corrections", "complaints")
  val secureDrop = FooterLink("SecureDrop", "https://www.theguardian.com/securedrop", "securedrop")
  val privacyPolicy = FooterLink("Privacy policy", "/info/privacy", "privacy")
  val cookiePolicy = FooterLink("Cookie policy", "/info/cookies", "cookie")
  val termsAndConditions = FooterLink("Terms & conditions", "/help/terms-of-service", "terms")

  def help(edition: String): FooterLink = FooterLink("Help", "/help", s"${edition} : footer : tech feedback", "js-tech-feedback-report")
  def workForUs(edition: String): FooterLink = FooterLink("Work for us", "https://workforus.theguardian.com", s"${edition} : footer : work for us")

  val ukListOne = List(
    FooterLink("About us", "/about", "uk : footer : about us"),
    FooterLink("Contact us", "/help/contact-us", "uk : footer : contact us"),
    complaintsAndCorrections,
    secureDrop,
    workForUs("uk"),
    privacyPolicy,
    cookiePolicy,
    termsAndConditions,
    help("uk"),
  )

  val usListOne = List(
    FooterLink("About us", "/info/about-guardian-us", "us : footer : about us"),
    FooterLink("Contact us", "/info/about-guardian-us/contact", "us : footer : contact us"),
    complaintsAndCorrections,
    secureDrop,
    workForUs("us"),
    privacyPolicy,
    cookiePolicy,
    termsAndConditions,
    help("us"),
  )

  val auListOne = List(
    FooterLink("About us", "/info/about-guardian-australia", "au : footer : about us"),
    FooterLink("Information", "/info", "au : footer : information"),
    FooterLink("Contact us", "/info/2013/may/26/contact-guardian-australia", "au : footer : contact us"),
    secureDrop,
    FooterLink("Vacancies","https://www.theguardian.com/info/2015/aug/04/guardian-australia-job-vacancies", "au : footer : vacancies"),
    privacyPolicy,
    cookiePolicy,
    termsAndConditions,
    help("au"),
  )

  val intListOne = List(
    FooterLink("Contact us", "/help/contact-us", "international : footer : contact us"),
    complaintsAndCorrections,
    secureDrop,
    workForUs("international"),
    privacyPolicy,
    cookiePolicy,
    termsAndConditions,
    help("international"),
  )

  // Footer column two

  def allTopics(edition: String): FooterLink = FooterLink("All topics", "/index/subjects/a", s"${edition} : footer : all topics")
  def allWriters(edition: String): FooterLink = FooterLink("All writers", "/index/contributors", s"${edition} : footer : all contributors")
  val digitalNewspaperArchive = FooterLink("Digital newspaper archive", "https://theguardian.newspapers.com", "digital newspaper archive")
  def facebook(edition: String): FooterLink = FooterLink("Facebook", "https://www.facebook.com/theguardian", s"${edition} : footer : facebook")
  def twitter(edition: String): FooterLink = FooterLink("Twitter", "https://twitter.com/guardian", s"${edition}: footer : twitter")

  val ukListTwo = List(
    allTopics("uk"),
    allWriters("uk"),
    FooterLink("Modern Slavery Act", "/info/2016/jul/27/modern-slavery-and-our-supply-chains?INTCMP=NGW_FOOTER_UK_GU_MODERN_SLAVERY_ACT", "uk : footer : modern slavery act statement"),
    digitalNewspaperArchive,
    facebook("uk"),
    twitter("uk")
  )

  val usListTwo = List(
    allTopics("us"),
    allWriters("us"),
    digitalNewspaperArchive,
    facebook("us"),
    twitter("us")
  )

  val auListTwo = List(
    allTopics("au"),
    allWriters("au"),
    FooterLink("Events", "/guardian-masterclasses/guardian-masterclasses-australia", "au : footer : masterclasses"),
    digitalNewspaperArchive,
    facebook("au"),
    twitter("au")
  )

  val intListTwo = List(
    allTopics("international"),
    allWriters("international"),
    digitalNewspaperArchive,
    facebook("international"),
    twitter("international")
  )

  // Footer column three

  def discountCodes(edition: String): FooterLink = FooterLink("Discount Codes", "https://discountcode.theguardian.com/", s"${edition}: footer : discount code", "js-discount-code-link")

  val ukListThree = List(
    FooterLink("Advertise with us", "https://advertising.theguardian.com", "uk : footer : advertise with us"),
    FooterLink("Guardian Labs", "/guardian-labs", "uk : footer : guardian labs"),
    FooterLink("Search jobs", "https://jobs.theguardian.com?INTCMP=NGW_FOOTER_UK_GU_JOBS", "uk : footer : jobs"),
    FooterLink("Dating", "https://soulmates.theguardian.com?INTCMP=NGW_FOOTER_UK_GU_SOULMATES", "uk : footer : soulmates"),
    FooterLink("Patrons", "https://patrons.theguardian.com?INTCMP=footer_patrons", "uk : footer : patrons"),
    discountCodes("uk")
  )

  val usListThree = List(
    FooterLink("Advertise with us", "https://advertising.theguardian.com/us/advertising", "us : footer : advertise with us"),
    FooterLink("Guardian Labs", "/guardian-labs-us", "us : footer : guardian labs"),
    FooterLink("Search jobs", "https://jobs.theguardian.com?INTCMP=NGW_FOOTER_US_GU_JOBS", "us : footer : jobs"),
    FooterLink("Dating", "https://soulmates.theguardian.com?INTCMP=soulmates_us_web_footer", "us : footer : soulmates"),
    discountCodes("us")
  )

  val auListThree = List(
    FooterLink("Guardian Labs", "/guardian-labs-australia", "au : footer : guardian labs"),
    FooterLink("Advertise with us", "https://advertising.theguardian.com/", "au : footer : advertise with us"),
    FooterLink("Search UK jobs", "https://jobs.theguardian.com?INTCMP=NGW_FOOTER_AU_GU_JOBS", "au : footer : uk-jobs"),
    FooterLink("Dating", "https://soulmates.theguardian.com?INTCMP=soulmates_au_web_footer", "au : footer : soulmates"),
    discountCodes("au")
  )

  val intListThree = List(
    FooterLink("Advertise with us", "https://advertising.theguardian.com", "international : footer : advertise with us"),
    FooterLink("Search UK jobs", "https://jobs.theguardian.com/?INTCMP=NGW_FOOTER_INT_GU_JOBS", "international : footer : uk-jobs"),
    FooterLink("Dating", "https://soulmates.theguardian.com/?INTCMP=soulmates_int_web_footer", "international : footer : soulmates"),
    discountCodes("international")
  )

  def getFooterByEdition(edition: Edition): Seq[Seq[FooterLink]] = edition match {
    case editions.Uk => Seq(ukListOne, ukListTwo, ukListThree)
    case editions.Us => Seq(usListOne, usListTwo, usListThree)
    case editions.Au => Seq(auListOne, auListTwo, auListThree)
    case editions.International => Seq(intListOne, intListTwo, intListThree)
    case _ => Seq(intListOne, intListTwo, intListThree)
  }

}


