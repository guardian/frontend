package controllers.commercial

import common.commercial.HostedPage
import conf.Static
import conf.switches.Switches
import model.Cached.RevalidatableResult
import model.{Cached, NoCache}
import play.api.mvc.{Action, AnyContent, Controller, Request}
import views.html.hosted.{episode1Video, guardianHostedPage, teaserVideo}

object HostedContentController extends Controller {

  def renderHostedPage(pageName: String) = Action { implicit request: Request[AnyContent] =>
    lazy val pageUrl = routes.HostedContentController.renderHostedPage(pageName).absoluteURL
    val teaserPoster: String = Static("images/commercial/renault-video-poster.jpg").path
    val episode1Poster: String = Static("images/commercial/renault-video-poster-ep1.jpg").path

    pageName match {

      case "design-competition-teaser" =>
        val page = HostedPage(
          pageUrl,
          pageName,
          pageTitle = "Advertiser content hosted by the Guardian: Designing the car of the future - video",
          videoTitle = "Designing the car of the future",
          nextVideoHeader = "Up next from",
          nextVideoTitle = "Renault shortlists 'car of the future' designs",
          nextVideoLink = "/commercial/advertiser-content/renault-car-of-the-future/design-competition-episode1",
          nextVideoImage = episode1Poster,
          standfirst = "Who better to dream up the cars of tomorrow than the people who'll be buying them? Students at Central St Martins are working with Renault to design the interior for cars that will drive themselves. Watch this short video to find out more about the project, and visit this page again soon to catch up on the students' progress.",
          posterImage = teaserPoster
        )
        Cached(60)(RevalidatableResult.Ok(guardianHostedPage(page, teaserVideo(teaserPoster))))

      case "design-competition-episode1" =>
        if (Switches.hostedEpisode1Content.isSwitchedOn) {
          val page = HostedPage(
            pageUrl,
            pageName,
            pageTitle = "Renault shortlists 'car of the future' designs - video",
            videoTitle = "Renault shortlists 'car of the future' designs",
            nextVideoHeader = "Also from",
            nextVideoTitle = "Designing the car of the future",
            nextVideoLink = "/commercial/advertiser-content/renault-car-of-the-future/design-competition-teaser",
            nextVideoImage = teaserPoster,
            standfirst = "Renault challenged Central St Martins students to dream up the car of the future. The winning design will be announced at Clerkenwell Design Week (and on this site). Watch this short video to find out who made the shortlist.",
            posterImage = episode1Poster
          )
          Cached(60)(RevalidatableResult.Ok(guardianHostedPage(page, episode1Video(episode1Poster))))
        } else {
          NoCache(NotFound)
        }

      case _ =>
        NoCache(NotFound)
    }
  }
}
