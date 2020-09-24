package model

import com.gu.contentapi.client.model.v1.{Content => CapiContent}
import com.gu.contentapi.client.model.{v1 => contentapi}
import com.gu.contentapi.client.utils.DesignType
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichContent
import implicits.Dates.CapiRichDateTime
import common.commercial.{AdUnitMaker, CommercialProperties}
import common.dfp._
import common.{Edition, LinkTo, Localisation, ManifestData, Pagination}
import conf.Configuration
import conf.cricketPa.CricketTeams
import model.content._
import model.liveblog.Blocks
import model.meta.{Guardian, LinkedData, PotentialAction, WebPage}
import org.apache.commons.lang3.StringUtils
import org.joda.time.DateTime
import com.github.nscala_time.time.Implicits._
import play.api.libs.json._
import play.api.libs.json.JodaWrites.JodaDateTimeWrites
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import navigation.GuardianFoundationHelper

import scala.util.matching.Regex

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
