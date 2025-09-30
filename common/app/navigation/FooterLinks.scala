package navigation

import common.{Edition, editions}
import common.editions.Uk.{networkFrontId => UK}
import common.editions.Us.{networkFrontId => US}
import common.editions.Au.{networkFrontId => AU}
import common.editions.International.{networkFrontId => INT}

case class FooterLink(
    text: String,
    url: String,
    dataLinkName: String,
    extraClasses: String = "",
)

object FooterLinks {

  // Helpers
  val complaintsAndCorrections =
    FooterLink("Complaints & corrections", "/info/complaints-and-corrections", "complaints")
  val secureDrop = FooterLink("SecureDrop", "https://www.theguardian.com/securedrop", "securedrop")
  val privacyPolicy = FooterLink("Privacy policy", "/info/privacy", "privacy")
  val cookiePolicy = FooterLink("Cookie policy", "/info/cookies", "cookie")
  val termsAndConditions = FooterLink("Terms & conditions", "/help/terms-of-service", "terms")
  val accessibilitySettings = FooterLink(
    "Accessibility settings",
    "/help/accessibility-help",
    "accessibility settings",
  )

  def help(edition: String): FooterLink =
    FooterLink(
      "Help",
      "https://manage.theguardian.com/help-centre",
      s"${edition} : footer : tech feedback",
      "js-tech-feedback-report",
    )
  def workForUs(edition: String): FooterLink =
    FooterLink("Work for us", "https://workforus.theguardian.com", s"${edition} : footer : work for us")
  def allTopics(edition: String): FooterLink =
    FooterLink("All topics", "/index/subjects/a", s"${edition} : footer : all topics")
  def allWriters(edition: String): FooterLink =
    FooterLink("All writers", "/index/contributors", s"${edition} : footer : all contributors")
  val digitalNewspaperArchive: FooterLink =
    FooterLink("Digital newspaper archive", "https://theguardian.newspapers.com", "digital newspaper archive")
  def taxStrategy(edition: String): FooterLink =
    FooterLink(
      "Tax strategy",
      "https://uploads.guim.co.uk/2025/09/05/Tax_strategy_for_the_year_ended_31_March_2025.pdf",
      s"${edition} : footer : tax strategy",
    )
  def facebook(edition: String): FooterLink =
    FooterLink("Facebook", "https://www.facebook.com/theguardian", s"${edition} : footer : facebook")
  def youtube(edition: String): FooterLink =
    FooterLink("YouTube", "https://www.youtube.com/user/TheGuardian", s"${edition} : footer : youtube")
  def linkedin(edition: String): FooterLink =
    FooterLink("LinkedIn", "https://www.linkedin.com/company/theguardian", s"${edition} : footer : linkedin")
  def instagram(edition: String): FooterLink =
    FooterLink("Instagram", "https://www.instagram.com/guardian", s"${edition} : footer : instagram")
  def newsletters(edition: String): FooterLink = {
    FooterLink(
      text = "Newsletters",
      url = s"/email-newsletters?INTCMP=DOTCOM_FOOTER_NEWSLETTER_${edition.toUpperCase}",
      dataLinkName = s"$edition : footer : newsletters",
    )
  }

    def modernSlaveryActStatement(edition: String): FooterLink = {
      FooterLink(
        "Modern Slavery Act",
        "https://uploads.guim.co.uk/2025/09/05/Modern_Slavery_Statement_2025.pdf",
        s"$edition : footer : modern slavery act statement",
      )
    }

    def tipUsOff(edition: String): FooterLink = {
      FooterLink("Tip us off", "https://www.theguardian.com/tips", s"$edition : footer : tips")
    }

  def searchJobs(edition: String): FooterLink = {
    FooterLink("Search jobs", "https://jobs.theguardian.com", s"$edition : footer : jobs")
  }


    /* Column one */

    val ukListOne = List(
      FooterLink("About us", "/about", s"$UK : footer : about us"),
      help(UK),
      complaintsAndCorrections,
      FooterLink("Contact us", "/help/contact-us", s"$UK : footer : contact us"),
      tipUsOff(UK),
      secureDrop,
      privacyPolicy,
      cookiePolicy,
      modernSlaveryActStatement(UK),
      taxStrategy(UK),
      termsAndConditions,
    )

    val usListOne = List(
      FooterLink("About us", "/info/about-guardian-us", s"$US : footer : about us"),
      help(US),
      complaintsAndCorrections,
      FooterLink("Contact us", "/info/about-guardian-us/contact", s"$US : footer : contact us"),
      tipUsOff(US),
      secureDrop,
      privacyPolicy,
      cookiePolicy,
      taxStrategy(US),
      termsAndConditions,
    )

    val auListOne = List(
      FooterLink("About us", "/info/about-guardian-australia", s"$AU : footer : about us"),
      FooterLink("Information", "/info", s"$AU : footer : information"),
      help(AU),
      complaintsAndCorrections,
      FooterLink("Contact us", "/info/2013/may/26/contact-guardian-australia", s"$AU : footer : contact us"),
      tipUsOff(AU),
      secureDrop,
      privacyPolicy,
      cookiePolicy,
      taxStrategy(AU),
      termsAndConditions,
    )

  def genericListOne(edition: String): List[FooterLink] = {
    List(
      FooterLink("About us", "/about", s"$edition : footer : about us"),
      help(edition),
      complaintsAndCorrections,
      FooterLink("Contact us", "/help/contact-us", s"$edition : footer : contact us"),
      tipUsOff(edition),
      secureDrop,
      privacyPolicy,
      cookiePolicy,
      taxStrategy(edition),
      termsAndConditions,
    )
  }

    /* Column two */
    val ukListTwo = List(
      allTopics(UK),
      allWriters(UK),
      newsletters(UK),
      digitalNewspaperArchive,
      facebook(UK),
      instagram(UK),
      linkedin(UK),
      youtube(UK),
    )

    val usListTwo = List(
      allTopics(US),
      allWriters(US),
      newsletters(US),
      digitalNewspaperArchive,
      facebook(US),
      instagram(US),
      linkedin(US),
      youtube(US),
    )

    val auListTwo = List(
      allTopics(AU),
      allWriters(AU),
      newsletters(AU),
      digitalNewspaperArchive,
      facebook(AU),
      instagram(AU),
      linkedin(AU),
      youtube(AU),
    )

  def genericListTwo(edition: String): List[FooterLink] = {
    List(
      allTopics(edition),
      allWriters(edition),
      newsletters(edition),
      digitalNewspaperArchive,
      facebook(edition),
      instagram(edition),
      linkedin(edition),
      youtube(edition),
    )
  }

    /* Column three */

    val ukListThree = List(
      FooterLink("Advertise with us", "https://advertising.theguardian.com", s"$UK : footer : advertise with us"),
      FooterLink("Guardian Labs", "/guardian-labs", s"$UK : footer : guardian labs"),
      searchJobs(UK),
      FooterLink("Patrons", "https://patrons.theguardian.com?INTCMP=footer_patrons", s"$UK : footer : patrons"),
      workForUs(UK),
      accessibilitySettings,
    )

    val usListThree = List(
      FooterLink(
        "Advertise with us",
        "https://usadvertising.theguardian.com",
        s"$US : footer : advertise with us",
      ),
      FooterLink("Guardian Labs", "/guardian-labs-us", s"$US : footer : guardian labs"),
      searchJobs(US),
      workForUs(US),
      accessibilitySettings,
    )

    val auListThree = List(
      FooterLink(
        "Advertise with us",
        "https://ausadvertising.theguardian.com/",
        s"$AU : footer : advertise with us",
      ),
      FooterLink("Guardian Labs", "/guardian-labs-australia", s"$AU : footer : guardian labs"),
      workForUs(AU),
      accessibilitySettings,
    )

  def genericListThree(edition: String): List[FooterLink] = {
    List(
      FooterLink(
        "Advertise with us",
        "https://advertising.theguardian.com",
        s"$edition : footer : advertise with us",
      ),
      FooterLink("Search UK jobs", "https://jobs.theguardian.com", s"$edition : footer : jobs"),
      FooterLink("Tips", "https://www.theguardian.com/tips", s"$edition : footer : tips"),
      accessibilitySettings,
      workForUs(edition),
    )
    }


    def getFooterByEdition(edition: Edition): Seq[Seq[FooterLink]] =
      edition match {
        case editions.Uk => Seq(ukListOne, ukListTwo, ukListThree)
        case editions.Us => Seq(usListOne, usListTwo, usListThree)
        case editions.Au => Seq(auListOne, auListTwo, auListThree)
        case editions.International => Seq(genericListOne(INT), genericListTwo(INT), genericListThree(INT))
      }
  }

