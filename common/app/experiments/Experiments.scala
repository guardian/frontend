package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._

import java.time.LocalDate

/*
 * This list of active experiments is sorted by participation group.
 */
object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] =
    Set(
      DarkModeWeb,
      DCRJavascriptBundle,
      LoopingVideo,
      NoBoosts,
      TopAboveNav250Reservation,
    )
  implicit val canCheckExperiment: CanCheckExperiment = new CanCheckExperiment(this)
}

object LoopingVideo
    extends Experiment(
      name = "looping-video",
      description = "Enable looping videos on DCR",
      owners = Seq(Owner.withEmail("fronts.and.curation@guardian.co.uk")),
      sellByDate = LocalDate.of(2025, 9, 30),
      participationGroup = Perc0A,
    )

object TopAboveNav250Reservation
    extends Experiment(
      name = "top-above-nav-250-reservation",
      description = "Reserve 250px for top-above-nav instead of 90px",
      owners = Seq(Owner.withEmail("commercial.dev@theguardian.com")),
      sellByDate = LocalDate.of(2025, 8, 29),
      participationGroup = Perc2A,
    )

object DarkModeWeb
    extends Experiment(
      name = "dark-mode-web",
      description = "Enable dark mode on web",
      owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2025, 10, 31),
      participationGroup = Perc0D,
    )

object DCRJavascriptBundle
    extends Experiment(
      name = "dcr-javascript-bundle",
      description = "DCAR JS bundle experiment to test replacing Preact with React",
      owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2025, 8, 29),
      participationGroup = Perc0E,
    )

object NoBoosts
    extends Experiment(
      name = "no-boosts",
      description = "Test the impact of removing boosts (excluding Splash) from the Flexible General container",
      owners = Seq(Owner.withEmail("fronts.and.curation@guardian.co.uk")),
      sellByDate = LocalDate.of(2025, 9, 30),
      participationGroup = Perc5A,
    )
