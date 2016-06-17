package common.commercial

import conf.Static
import conf.switches.Switches
import model.GuardianContentTypes.Hosted
import model.{MetaData, SectionSummary, StandalonePage}
import play.api.libs.json.JsString

trait HostedPage extends StandalonePage  {
  def pageUrl: String
  def pageName: String
  def pageTitle: String
  def logoUrl: String
}

case class HostedVideoPage(
                       pageUrl: String,
                       pageName: String,
                       standfirst: String,
                       logoUrl: String,
                       bannerUrl: String,
                       video: HostedVideo,
                       nextPageName: String
                     ) extends HostedPage {

  val pageTitle: String  = s"Advertiser content hosted by the Guardian: ${video.title} - video"

  override val metadata: MetaData = {
    val toneId = "tone/hosted-content"
    val toneName = "Hosted content"
    val sectionId = "renault-car-of-the-future"
    val keywordId = s"$sectionId/$sectionId"
    val keywordName = sectionId
    MetaData.make(
      id = s"commercial/advertiser-content/$sectionId/$pageName",
      webTitle = pageTitle,
      section = Some(SectionSummary.fromId(sectionId)),
      contentType = Hosted,
      analyticsName = s"GFE:$sectionId:$Hosted:$pageName",
      description = Some(standfirst),
      javascriptConfigOverrides = Map(
        "keywordIds" -> JsString(keywordId),
        "keywords" -> JsString(keywordName),
        "toneIds" -> JsString(toneId),
        "tones" -> JsString(toneName)
      ),
      opengraphPropertiesOverrides = Map(
        "og:url" -> pageUrl,
        "og:title" -> pageTitle,
        "og:description" ->
          s"ADVERTISER CONTENT FROM RENAULT HOSTED BY THE GUARDIAN | $standfirst",
        "og:image" -> video.posterUrl,
        "fb:app_id" -> "180444840287"
      )
    )
  }

  lazy val nextPage : HostedVideoPage = HostedPage.fromPageName(nextPageName).collect{case v: HostedVideoPage => v} getOrElse HostedPage.defaultPage
}

case class HostedGalleryPage(
                       pageUrl: String,
                       pageName: String,
                       images: List[String],
                       logoUrl: String
                     ) extends HostedPage {

  val pageTitle: String  = s"Advertiser content hosted by the Guardian: $pageName - gallery"

  override val metadata: MetaData = {
    val toneId = "tone/hosted-content"
    val toneName = "Hosted content"
    val sectionId = "renault-car-of-the-future"
    val keywordId = s"$sectionId/$sectionId"
    val keywordName = sectionId
    MetaData.make(
      id = s"commercial/advertiser-content/$sectionId/$pageName",
      webTitle = pageTitle,
      section = Some(SectionSummary.fromId(sectionId)),
      contentType = Hosted,
      analyticsName = s"GFE:$sectionId:$Hosted:$pageName",
      description = Some(pageTitle),
      javascriptConfigOverrides = Map(
        "keywordIds" -> JsString(keywordId),
        "keywords" -> JsString(keywordName),
        "toneIds" -> JsString(toneId),
        "tones" -> JsString(toneName)
      ),
      opengraphPropertiesOverrides = Map(
        "og:url" -> pageUrl,
        "og:title" -> pageTitle,
        "og:description" ->
          s"ADVERTISER CONTENT FROM RENAULT HOSTED BY THE GUARDIAN | $pageName",
        "og:image" -> logoUrl,
        "fb:app_id" -> "180444840287"
      )
    )
  }
}

case class HostedVideo(
                        mediaId: String,
                        title: String,
                        duration: Int,
                        posterUrl: String,
                        srcUrl: String
                      )

object HostedPage {

  private val teaserPageName = "design-competition-teaser"
  private val episode1PageName = "design-competition-episode1"
  private val episode2PageName = "design-competition-episode2"
  private val galleryPageName = "gallery-test"

  private val teaser: HostedVideoPage = HostedVideoPage(
    pageUrl = "https://www.theguardian.com/commercial/advertiser-content/renault-car-of-the-future/design-competition-teaser",
    pageName = teaserPageName,
    standfirst = "Who better to dream up the cars of tomorrow than the people who'll be buying them? Students at Central St Martins are working with Renault to design the interior for cars that will drive themselves. Watch this short video to find out more about the project, and visit this page again soon to catch up on the students' progress",
    logoUrl = Static("images/commercial/logo_renault.jpg"),
    bannerUrl = Static("images/commercial/ren_commercial_banner.jpg"),
    video = HostedVideo(
      mediaId = "renault-car-of-the-future",
      title = "Designing the car of the future",
      duration = 86,
      posterUrl = Static("images/commercial/renault-video-poster.jpg"),
      srcUrl = "https://multimedia.guardianapis.com/interactivevideos/video.php?file=160516GlabsTestSD"
    ),
    nextPageName = episode1PageName
  )

  private val episode1: HostedVideoPage = HostedVideoPage(
    pageUrl = "https://www.theguardian.com/commercial/advertiser-content/renault-car-of-the-future/design-competition-episode1",
    pageName = episode1PageName,
    standfirst = "Renault challenged Central St Martins students to dream up the car of the future. The winning design will be announced at Clerkenwell Design Week (and on this site). Watch this short video to find out who made the shortlist",
    logoUrl = Static("images/commercial/logo_renault.jpg"),
    bannerUrl = Static("images/commercial/ren_commercial_banner.jpg"),
    video = HostedVideo(
      mediaId = "renault-car-of-the-future",
      title = "Renault shortlists 'car of the future' designs",
      duration = 160,
      posterUrl = Static("images/commercial/renault-video-poster-ep1.jpg"),
      srcUrl = "https://multimedia.guardianapis.com/interactivevideos/video.php?file=160523GlabsRenaultTestHD"
    ),
    nextPageName = episode2PageName
  )

  private val episode2: HostedVideoPage = HostedVideoPage(
    pageUrl = "https://www.theguardian.com/commercial/advertiser-content/renault-car-of-the-future/design-competition-episode2",
    pageName = episode2PageName,
    standfirst = "A group of Central St Martins students took part in a competition to dream up the car of the future. The winning design is radical and intriguing. Meet the team whose blue-sky thinking may have created a blueprint for tomorrow's autonomous cars",
    logoUrl = Static("images/commercial/logo_renault.jpg"),
    bannerUrl = Static("images/commercial/ren_commercial_banner.jpg"),
    video = HostedVideo(
      mediaId = "renault-car-of-the-future",
      title = "Is this the car of the future?",
      duration = 158,
      posterUrl = Static("images/commercial/renault-video-poster-ep2.jpg"),
      srcUrl = "http://multimedia.guardianapis.com/interactivevideos/video.php?file=160603GlabsRenaultTest3"
    ),
    nextPageName = episode1PageName
  )

  private val gallery: HostedGalleryPage = HostedGalleryPage(
    images = (1 to 7).map(n => s"http://static.theguardian.com/commercial/hosted/gallery-prototype/omgb$n.jpg").toList,
    pageUrl = "https://www.theguardian.com/commercial/advertiser-content/hosted-gallery/gallery-test",
    pageName = galleryPageName,
    logoUrl = "http://static.theguardian.com/commercial/hosted/gallery-prototype/omgb.png"
  )

  lazy val defaultPage = teaser

  def fromPageName(pageName: String): Option[HostedPage] = {
    pageName match {
      case `teaserPageName` => Some(teaser)
      case `episode1PageName` => Some(episode1)
      case `episode2PageName` => Some(episode2)
      case `galleryPageName` if Switches.hostedGalleryTest.isSwitchedOn => Some(gallery)
      case _ => None
    }
  }
}
