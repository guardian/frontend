package model

import model.content._
import play.api.mvc.RequestHeader
import play.twirl.api.Html

trait AtomPage extends Page {
  def atom: Atom
  def atomType: String
  def body: Html
  def withJavaScript: Boolean
  def withVerticalScrollbar: Boolean
  def javascriptModule: String = atomType
}

case class ChartAtomPage(
    override val atom: ChartAtom,
    override val withJavaScript: Boolean,
    override val withVerticalScrollbar: Boolean,
)(implicit request: RequestHeader, context: ApplicationContext)
    extends AtomPage {
  override val atomType = "chart"
  override val body = views.html.fragments.atoms.chart(atom, shouldFence = false)
  override val javascriptModule = "snippet"
  override val metadata = MetaData.make(
    id = atom.id,
    webTitle = atom.title,
    section = None,
  )
}

case class GuideAtomPage(
    override val atom: GuideAtom,
    override val withJavaScript: Boolean,
    override val withVerticalScrollbar: Boolean,
)(implicit request: RequestHeader)
    extends AtomPage {
  override val atomType = "guide"
  override val body = views.html.fragments.atoms.snippets.guide(atom)
  override val javascriptModule = "snippet"
  override val metadata = MetaData.make(
    id = atom.id,
    webTitle = atom.atom.title.getOrElse("Guide"),
    section = None,
  )
}

case class InteractiveAtomPage(
    override val atom: InteractiveAtom,
    override val withJavaScript: Boolean,
    override val withVerticalScrollbar: Boolean,
)(implicit request: RequestHeader, context: ApplicationContext)
    extends AtomPage {
  override val atomType = "interactive"
  override val body = views.html.fragments.atoms.interactive(atom, shouldFence = false)
  override val javascriptModule = "snippet"
  override val metadata = MetaData.make(
    id = atom.id,
    webTitle = atom.title,
    section = None,
  )
}

case class MediaAtomPage(
    override val atom: MediaAtom,
    override val withJavaScript: Boolean,
    override val withVerticalScrollbar: Boolean,
)(implicit request: RequestHeader)
    extends AtomPage {
  override val atomType = "media"
  override val body = views.html.fragments.atoms
    .media(atom, displayCaption = false, mediaWrapper = Some(MediaWrapper.EmbedPage), posterImageOverride = None)
  override val javascriptModule = "youtube-embed"
  override val metadata = MetaData.make(
    id = atom.id,
    webTitle = atom.title,
    section = None,
  )
}

case class ProfileAtomPage(
    override val atom: ProfileAtom,
    override val withJavaScript: Boolean,
    override val withVerticalScrollbar: Boolean,
)(implicit request: RequestHeader)
    extends AtomPage {
  override val atomType = "profile"
  override val body = views.html.fragments.atoms.snippets.profile(atom)
  override val javascriptModule = "snippet"
  override val metadata = MetaData.make(
    id = atom.id,
    webTitle = atom.atom.title.getOrElse("Profile"),
    section = None,
  )
}

case class QandaAtomPage(
    override val atom: QandaAtom,
    override val withJavaScript: Boolean,
    override val withVerticalScrollbar: Boolean,
)(implicit request: RequestHeader)
    extends AtomPage {
  override val atomType = "qanda"
  override val body = views.html.fragments.atoms.snippets.qanda(atom)
  override val javascriptModule = "snippet"
  override val metadata = MetaData.make(
    id = atom.id,
    webTitle = atom.atom.title.getOrElse("Q&A"),
    section = None,
  )
}

case class TimelineAtomPage(
    override val atom: TimelineAtom,
    override val withJavaScript: Boolean,
    override val withVerticalScrollbar: Boolean,
)(implicit request: RequestHeader)
    extends AtomPage {
  override val atomType = "timeline"
  override val body = views.html.fragments.atoms.snippets.timeline(atom)
  override val javascriptModule = "snippet"
  override val metadata = MetaData.make(
    id = atom.id,
    webTitle = atom.atom.title.getOrElse("Timeline"),
    section = None,
  )
}
