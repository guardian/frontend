package controllers.commercial

import common.commercial.{HostedPage, HostedVideo}
import conf.Static
import conf.switches.Switches
import model.Cached.RevalidatableResult
import model.{Cached, NoCache}
import play.api.mvc.{Action, AnyContent, Controller, Request}
import views.html.hosted.guardianHostedPage

object HostedContentController extends Controller {

  def renderHostedPage(pageName: String) = Action { implicit request: Request[AnyContent] =>
    lazy val pageUrl = routes.HostedContentController.renderHostedPage(pageName).absoluteURL
    pageName match {

      case "design-competition-teaser" =>
        val page = HostedPage(
          pageUrl,
          pageName,
          pageTitle = "Advertiser content hosted by the Guardian: Designing the car of the future - video",
          standfirst = "Who better to dream up the cars of tomorrow than the people who'll be buying them? Students at Central St Martins are working with Renault to design the interior for cars that will drive themselves. Watch this short video to find out more about the project, and visit this page again soon to catch up on the students' progress.",
          logoUrl = Static("images/commercial/logo_renault.jpg"),
          bannerUrl = Static("images/commercial/ren_commercial_banner.jpg"),
          video = HostedVideo(
            mediaId = "renault-car-of-the-future",
            title = "Designing the car of the future",
            duration = 86,
            posterUrl = Static("images/commercial/renault-video-poster.jpg"),
            srcUrl = "http://multimedia.guardianapis.com/interactivevideos/video.php?file=160516GlabsTestSD&format=video/mp4&maxbitrate=2048"
          )
        )
        Cached(60)(RevalidatableResult.Ok(guardianHostedPage(page)))

      case "design-competition-episode1" =>
        if (Switches.hostedEpisode1Content.isSwitchedOn) {
          val page = HostedPage(
            pageUrl,
            pageName,
            pageTitle = "Renault shortlists 'car of the future' designs - video",
            standfirst = "Renault challenged Central St Martins students to dream up the car of the future. The winning design will be announced at Clerkenwell Design Week (and on this site). Watch this short video to find out who made the shortlist.",
            logoUrl = Static("images/commercial/logo_renault.jpg"),
            bannerUrl = Static("images/commercial/ren_commercial_banner.jpg"),
            video = HostedVideo(
              mediaId = "renault-car-of-the-future",
              title = "Renault shortlists 'car of the future' designs",
              duration = 160,
              posterUrl = Static("images/commercial/renault-video-poster-ep1.jpg"),
              srcUrl = "https://multimedia.guardianapis.com/interactivevideos/video.php?file=160523GlabsRenaultTestHD&format=video/webm&maxbitrate=2048"
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
