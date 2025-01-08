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
      EuropeBetaFront,
      CommercialBundleUpdater,
      DarkModeWeb,
    )
  implicit val canCheckExperiment: CanCheckExperiment = new CanCheckExperiment(this)
}

object EuropeBetaFront
    extends Experiment(
      name = "europe-beta-front",
      description = "Allows viewing the beta version of the Europe network front",
      owners = Seq(
        Owner.withGithub("cemms1"),
        Owner.withEmail("project.fairground@theguardian.com"),
        Owner.withEmail("dotcom.platform@theguardian.com"),
      ),
      sellByDate = LocalDate.of(2025, 4, 2),
      participationGroup = Perc0A,
    )

object DarkModeWeb
    extends Experiment(
      name = "dark-mode-web",
      description = "Enable dark mode on web",
      owners = Seq(Owner.withGithub("jakeii"), Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2025, 1, 30),
      participationGroup = Perc0D,
    )

object CommercialBundleUpdater
    extends Experiment(
      name = "commercial-bundle-updater",
      description = "Enable the commercial bundle updater",
      owners = Seq(Owner.withGithub("jakeii")),
      sellByDate = LocalDate.of(2025, 1, 30),
      participationGroup = Perc5A,
    )
