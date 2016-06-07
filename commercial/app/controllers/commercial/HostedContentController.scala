package controllers.commercial

import common.commercial.{HostedPage, HostedVideo, HostedNextVideo}
import conf.Static
import conf.switches.Switches
import model.Cached.RevalidatableResult
import model.{Cached, NoCache}
import play.api.mvc.{Action, AnyContent, Controller, Request}
import views.html.hosted.guardianHostedPage

object HostedContentController extends Controller {

  def renderHostedPage(pageName: String) = Action { implicit request: Request[AnyContent] =>
    lazy val pageUrl = routes.HostedContentController.renderHostedPage(pageName).absoluteURL
    val teaserPosterUrl: String = Static("images/commercial/renault-video-poster.jpg")
    val episode1PosterUrl: String = Static("images/commercial/renault-video-poster-ep1.jpg")
    val episode2PosterUrl: String = Static("images/commercial/renault-video-poster-ep2.jpg")

    pageName match {

      case "design-competition-teaser" =>
        val page = HostedPage(
          pageUrl,
          pageName,
          pageTitle = "Advertiser content hosted by the Guardian: Designing the car of the future - video",
          standfirst = "Who better to dream up the cars of tomorrow than the people who'll be buying them? Students at Central St Martins are working with Renault to design the interior for cars that will drive themselves. Watch this short video to find out more about the project, and visit this page again soon to catch up on the students' progress",
          logoUrl = Static("images/commercial/logo_renault.jpg"),
          bannerUrl = Static("images/commercial/ren_commercial_banner.jpg"),
          video = HostedVideo(
            mediaId = "renault-car-of-the-future",
            title = "Designing the car of the future",
            duration = 86,
            posterUrl = teaserPosterUrl,
            srcUrl = "https://multimedia.guardianapis.com/interactivevideos/video.php?file=160516GlabsTestSD"
          ),
          nextVideo = HostedNextVideo(
            title = "Renault shortlists 'car of the future' designs",
            link = "/commercial/advertiser-content/renault-car-of-the-future/design-competition-episode1",
            imageUrl = episode1PosterUrl
          )
        )
        Cached(60)(RevalidatableResult.Ok(guardianHostedPage(page)))

      case "design-competition-episode1" =>
        val page = HostedPage(
          pageUrl,
          pageName,
          pageTitle = "Renault shortlists 'car of the future' designs - video",
          standfirst = "Renault challenged Central St Martins students to dream up the car of the future. The winning design will be announced at Clerkenwell Design Week (and on this site). Watch this short video to find out who made the shortlist",
          logoUrl = Static("images/commercial/logo_renault.jpg"),
          bannerUrl = Static("images/commercial/ren_commercial_banner.jpg"),
          video = HostedVideo(
            mediaId = "renault-car-of-the-future",
            title = "Renault shortlists 'car of the future' designs",
            duration = 160,
            posterUrl = episode1PosterUrl,
            srcUrl = "https://multimedia.guardianapis.com/interactivevideos/video.php?file=160523GlabsRenaultTestHD"
          ),
          nextVideo = if(Switches.hostedEpisode2Content.isSwitchedOn) HostedNextVideo(
            title = "Is this the car of the future?",
            link = "/commercial/advertiser-content/renault-car-of-the-future/design-competition-episode2",
            imageUrl = episode2PosterUrl
          ) else HostedNextVideo(
            title = "Designing the car of the future",
            link = "/commercial/advertiser-content/renault-car-of-the-future/design-competition-teaser",
            imageUrl = teaserPosterUrl
          )
        )
        Cached(60)(RevalidatableResult.Ok(guardianHostedPage(page)))


      case "design-competition-episode2" =>
        if (Switches.hostedEpisode2Content.isSwitchedOn) {
          val page = HostedPage(
            pageUrl,
            pageName,
            pageTitle = "Is this the car of the future? - video",
            standfirst = "A group of Central St Martins students took part in a competition to dream up the car of the future. The winning design is radical and intriguing. Meet the team whose blue-sky thinking may have created a blueprint for tomorrow's autonomous cars",
            logoUrl = Static("images/commercial/logo_renault.jpg"),
            bannerUrl = Static("images/commercial/ren_commercial_banner.jpg"),
            video = HostedVideo(
              mediaId = "renault-car-of-the-future",
              title = "Is this the car of the future?",
              duration = 160,
              posterUrl = episode2PosterUrl,
              srcUrl = "http://multimedia.guardianapis.com/interactivevideos/video.php?file=160603GlabsRenaultTest3"
            ),
            nextVideo = HostedNextVideo(
              title = "Renault shortlists 'car of the future' designs",
              link = "/commercial/advertiser-content/renault-car-of-the-future/design-competition-episode1",
              imageUrl = episode1PosterUrl
            )
          )
          Cached(60)(RevalidatableResult.Ok(guardianHostedPage(page)))
        } else {
          NoCache(NotFound)
        }

      case _ =>
        NoCache(NotFound)
    }
  }
}
