package football.model

import common.Edition
import conf.switches.Switches.WomensEuro2025Atom
import contentapi.ContentApiClient
import model.content.InteractiveAtom
import play.api.mvc.{AnyContent, Request}

import scala.concurrent.{ExecutionContext, Future}

object FootballWomensEuro2025Atom {
  def getAtom(competition: String, contentApiClient: ContentApiClient, atomId: String)(implicit
      request: Request[AnyContent],
      executionContext: ExecutionContext,
  ) = {
    if (WomensEuro2025Atom.isSwitchedOn && competition == "women-s-euro-2025") {
      val edition = Edition(request)
      contentApiClient
        .getResponse(contentApiClient.item(atomId, edition))
        .map(_.interactive.map(InteractiveAtom.make(_)))
        .recover { case _ => None }
    } else Future.successful(None)
  }
}
