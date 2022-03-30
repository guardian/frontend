package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._
import java.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    LiveblogRendering,
    StickyVideos,
    SlideshowCaptions,
  )

  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object LiveblogRendering
    extends Experiment(
      name = "liveblog-rendering",
      description = "Use DCR for liveblogs",
      owners = Seq(Owner.withGithub("shtukas")),
      sellByDate = LocalDate.of(2022, 6, 2),
      participationGroup = Perc1A,
    )

object FrontRendering
    extends Experiment(
      name = "front-rendering",
      description = "Use DCR for fronts",
      owners = Seq(Owner.withGithub("dotcom")),
      sellByDate = LocalDate.of(2023, 6, 2),
      participationGroup = Perc0A,
    )

object StickyVideos
    extends Experiment(
      name = "sticky-videos",
      description = "Stick videos on live blogs",
      owners = Seq(Owner.withGithub("joecowton1")),
      sellByDate = LocalDate.of(2022, 6, 2),
      participationGroup = Perc0C,
    )

object SlideshowCaptions
    extends Experiment(
      name = "slideshow-captions",
      description = "Captions on fronts slideshows",
      owners = Seq(Owner.withGithub("jamesgorrie")),
      sellByDate = LocalDate.of(2022, 6, 2),
      participationGroup = Perc0B,
    )
