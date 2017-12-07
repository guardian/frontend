package commercial.model.hosted

import com.gu.contentapi.client.model.v1._
import com.gu.contentatom.thrift.atom.cta.CTAAtom
import com.gu.contentatom.thrift.{Atom, AtomData, AtomType, ContentChangeDetails}
import org.scalatest.{FlatSpec, Matchers}

class HostedTrailsTest extends FlatSpec with Matchers {

  private def mkAtom(): Atoms = new Atoms {
    val quizzes = None
    val viewpoints = None
    val media = None
    val explainers = None
    val interactives = None
    val recipes = None
    val reviews = None
    val storyquestions = None
    val guides = None
    val profiles = None
    val qandas = None
    val timelines = None
    val cta = Some(
      Seq(
        new Atom {
          val id = ""
          val atomType = AtomType.Cta
          val labels = Nil
          val defaultHtml = ""
          val title = None
          val commissioningDesks = Nil
          val data: AtomData = AtomData.Cta(
            new CTAAtom {
              val url = ""
              val backgroundImage = None
              val btnText = None
              val label = None
              val trackingCode = None
            }
          )
          val contentChangeDetails = new ContentChangeDetails {
            val lastModified = None
            val created = None
            val published = None
            val takenDown = None
            val revision = 0L
            val scheduledLaunch = None
            val embargo = None
          }
          val flags = None
        }
      )
    )
  }

  private def mkSponsorship(): Sponsorship = new Sponsorship {
    val sponsorshipType = SponsorshipType.PaidContent
    val sponsorName = ""
    val sponsorLogo = ""
    val sponsorLink = ""
    val targeting = None
    val aboutLink = None
    val sponsorLogoDimensions = None
    val highContrastSponsorLogo = None
    val highContrastSponsorLogoDimensions = None
    val validFrom = None
    val validTo = None
  }

  private def mkTag(
    tagType: TagType,
    pdContentType: Option[String] = None,
    sponsorship: Option[Sponsorship] = None
  ): Tag = new Tag {
    val id = ""
    val `type` = tagType
    val sectionId = None
    val sectionName = None
    val webTitle = ""
    val webUrl = ""
    val apiUrl = ""
    val references = Nil
    val description = None
    val bio = None
    val bylineImageUrl = None
    val bylineLargeImageUrl = None
    val podcast = None
    val firstName = None
    val lastName = None
    val emailAddress = None
    val twitterHandle = None
    val activeSponsorships = sponsorship map (s => Seq(s))
    val paidContentType = pdContentType
    val paidContentCampaignColour = Some("#000000")
    val rcsId = None
    val r2ContributorId = None
    val tagCategories = None
    val entityIds = None
  }

  private def mkHostedTag(): Tag = mkTag(
    tagType = TagType.PaidContent,
    pdContentType = Some("HostedContent"),
    sponsorship = Some(mkSponsorship())
  )

  private def mkToneTag(): Tag = mkTag(
    tagType = TagType.Tone
  )

  private def mkContent(itemId: String, publishedDateTime: Long): Content = new Content {
    val id = itemId
    val `type` = ContentType.Article
    val section = Some(
      Section(
        id = "advertiser-content/campaign",
        webTitle = "sectionName",
        webUrl = "webUrl",
        apiUrl = "apiUrl",
        editions = Nil,
        activeSponsorships = None
      )
    )
    val sectionId = Some("advertiser-content/campaign")
    val sectionName = Some("sectionName")
    val webPublicationDate = Some(CapiDateTime(dateTime = publishedDateTime, iso8601 = ""))
    val webTitle = ""
    val webUrl = itemId
    val apiUrl = ""
    val fields = None
    val tags = Seq(mkToneTag(), mkHostedTag())
    val elements = None
    val references = Nil
    val isExpired = None
    val blocks = None
    val rights = None
    val crossword = None
    val atoms = Some(mkAtom())
    val stats = None
    val debug = None
    val isGone = None
    val isHosted = true
    val pillarId = None
    val pillarName = None
  }

  private val content = Seq(
    mkContent("advertiser-content/campaign/page1", 1),
    mkContent("advertiser-content/campaign/page2", 2),
    mkContent("advertiser-content/campaign/page3", 3),
    mkContent("advertiser-content/campaign/page4", 4)
  )

  "fromContent" should "give later trails when later content available" in {
    val trails = HostedTrails.fromContent("advertiser-content/campaign/page1", 2, content)
    trails.size shouldBe 2
    trails.map(_.id) shouldBe Seq("advertiser-content/campaign/page2", "advertiser-content/campaign/page3")
  }

  it should "give mixture of later and earlier trails if not enough later content available" in {
    val trails = HostedTrails.fromContent("advertiser-content/campaign/page3", 2, content)
    trails.size shouldBe 2
    trails.map(_.id) shouldBe Seq("advertiser-content/campaign/page1", "advertiser-content/campaign/page4")
  }

  it should "give earlier trails only if no later content available" in {
    val trails = HostedTrails.fromContent("advertiser-content/campaign/page4", 2, content)
    trails.size shouldBe 2
    trails.map(_.id) shouldBe Seq("advertiser-content/campaign/page1", "advertiser-content/campaign/page2")
  }

  it should "give fewer trails if not enough content in campaign" in {
    val content = Seq(
      mkContent("advertiser-content/campaign/page1", 1),
      mkContent("advertiser-content/campaign/page2", 2)
    )
    val trails = HostedTrails.fromContent("advertiser-content/campaign/page1", 2, content)
    trails.size shouldBe 1
    trails.map(_.id) shouldBe Seq("advertiser-content/campaign/page2")
  }

  it should "give no trails if only one item in campaign" in {
    val content = Seq(mkContent("advertiser-content/campaign/page1", 1))
    val trails = HostedTrails.fromContent("advertiser-content/campaign/page1", 2, content)
    trails shouldBe empty
  }
}
