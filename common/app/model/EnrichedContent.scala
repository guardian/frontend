package model.pressed

import model.dotcomrendering.pageElements.{
  AudioAtomBlockElement,
  CallToActionAtomBlockElement,
  ExplainerAtomBlockElement,
  TempFootballCompetitionAtomBlockElement,
  GuideAtomBlockElement,
  ProfileAtomBlockElement,
  QABlockElement,
  TimelineAtomBlockElement,
}

// EnrichedContent is an optionally-present field of the PressedContent class.
// It contains additional content that has been pre-fetched by facia-press, to
// enable facia-server-side rendering of FAPI content, such as embeds.
final case class EnrichedContent(
    embedHtml: Option[String],
    embedCss: Option[String],
    embedJs: Option[String],
    // Atom block elements pre-fetched by facia-press so that atoms placed on
    // fronts (as snaps) can be rendered server-side. Each field mirrors the
    // equivalent DCR block element for that atom type.
    // Spike: for now each atom type is its own optional field.
    GuideAtom: Option[GuideAtomBlockElement],
    QandaAtom: Option[QABlockElement],
    ProfileAtom: Option[ProfileAtomBlockElement],
    TimelineAtom: Option[TimelineAtomBlockElement],
    AudioAtom: Option[AudioAtomBlockElement],
    ExplainerAtom: Option[ExplainerAtomBlockElement],
    TempFootballCompetitionAtom: Option[TempFootballCompetitionAtomBlockElement],
    CtaAtom: Option[CallToActionAtomBlockElement],
)

object EnrichedContent {
  val empty = EnrichedContent(
    embedHtml = None,
    embedCss = None,
    embedJs = None,
    GuideAtom = None,
    QandaAtom = None,
    ProfileAtom = None,
    TimelineAtom = None,
    AudioAtom = None,
    ExplainerAtom = None,
    TempFootballCompetitionAtom = None,
    CtaAtom = None,
  )
}
