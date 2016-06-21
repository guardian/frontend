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
  def standfirst: String
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
                       title: String,
                       standfirst: String,
                       images: List[HostedGalleryImage],
                       logoUrl: String
                     ) extends HostedPage {

  val pageTitle: String  = s"Advertiser content hosted by the Guardian: $title - gallery"

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
          s"ADVERTISER CONTENT FROM RENAULT HOSTED BY THE GUARDIAN | $title",
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

case class HostedGalleryImage(
                        url: String,
                        title: String,
                        caption: String
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

  private val omgbImages : List[HostedGalleryImage] = List(
    HostedGalleryImage (
      url = "http://static.theguardian.com/commercial/hosted/gallery-prototype/omgb1.jpg",
      title = "Finding the giants of Heligan",
      caption = "The Lost Gardens of Heligan, Cornwall, England. These gardens, along with their giants, were lost for 25 years under a tangle of weeds before being restored to take their place among the finest gardens in Great Britain."
    ),
    HostedGalleryImage (
      url = "http://static.theguardian.com/commercial/hosted/gallery-prototype/omgb2.jpg",
      title = "Rolling hills and rugged moorland",
      caption = "Malham Tarn Estate, Yorkshire Dales, England. Get your boots on and start exploring this popular Yorkshire Dales beauty spot."
    ),
    HostedGalleryImage (
      url = "http://static.theguardian.com/commercial/hosted/gallery-prototype/omgb3.jpg",
      title = "A walker’s paradise",
      caption = "Isle of Skye, Scotland. From family walks on the spectacular coastline to dramatic scrambles in the Cuillin mountains, the island provides fantastic walking for everyone. Photo by Lars Scheider"
    ),
    HostedGalleryImage (
      url = "http://static.theguardian.com/commercial/hosted/gallery-prototype/omgb4.jpg",
      title = "Walking on water",
      caption = "Loch Lomond & The Trossachs National Park, Scotland. The National Park stretches from the incredible mountains and glens of the Trossachs to the vast tranquil beauty of Loch Lomond. Photo by Bestjobers"
    ),
    HostedGalleryImage (
      url = "http://static.theguardian.com/commercial/hosted/gallery-prototype/omgb5.jpg",
      title = "Running across the plains",
      caption = "Isle of Harris, Scotland. The Isle of Harris isn’t actually an island, it’s the southern and more mountainous part of Lewis and Harris, the largest island in the Outer Hebrides. Photo by Lars Scheider"
    ),
    HostedGalleryImage (
      url = "http://static.theguardian.com/commercial/hosted/gallery-prototype/omgb6.jpg",
      title = "Relaxing at Loch Maree",
      caption = "Loch Maree, Scotland. More than 60 islands dot Loch Maree and the area is perfect for bird watching and walking."
    ),
    HostedGalleryImage (
      url = "http://static.theguardian.com/commercial/hosted/gallery-prototype/omgb7.jpg",
      title = "The ruins of Tintern Abbey",
      caption = "Monmouthshire, Wales. The ruins of this 12th-century abbey are famous for inspiring the works of notable English artists, including Romantic poet William Wordsworth and painter Thomas Gainsborough."
    )
  )

  private val gallery: HostedGalleryPage = HostedGalleryPage(
    images = omgbImages,
    pageUrl = "https://www.theguardian.com/commercial/advertiser-content/hosted-gallery/gallery-test",
    pageName = galleryPageName,
    title = "Great Britain - Home of Amazing Moments #OMGB",
    standfirst = "Welcome to Great Britain, a country to be explored, experienced and discovered. See for yourself and discover the moments you'll want to share.",
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
