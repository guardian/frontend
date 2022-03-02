package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._
import java.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    LiveblogRendering,
    StickyVideos,
  )

  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object LiveblogRendering
    extends Experiment(
      name = "liveblog-rendering",
      description = "Use DCR for liveblogs",
      owners = Seq(Owner.withGithub("shtukas")),
      sellByDate = LocalDate.of(2022, 6, 2),
      participationGroup = Perc10A,
    )

object StickyVideos
    extends Experiment(
      name = "sticky-videos",
      description = "Stick videos on live blogs",
      owners = Seq(Owner.withGithub("joecowton1")),
      sellByDate = LocalDate.of(2022, 6, 2),
      participationGroup = Perc0C,
    )
