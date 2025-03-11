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
      LoopVideoTest,
      DCRCrosswords,
      DarkModeWeb,
      DCRFootballLive,
      FiveFourImages,
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

object LoopVideoTest
    extends Experiment(
      name = "loop-video-test",
      description = "Test looping videos effect on Core Web Vitals",
      owners = Seq(Owner.withEmail("fronts.and.curation@guardian.co.uk")),
      sellByDate = LocalDate.of(2025, 5, 28),
      participationGroup = Perc0B,
    )

object DCRCrosswords
    extends Experiment(
      name = "dcr-crosswords",
      description = "Render crosswords in DCR",
      owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2025, 3, 31),
      participationGroup = Perc20A,
    )

object DarkModeWeb
    extends Experiment(
      name = "dark-mode-web",
      description = "Enable dark mode on web",
      owners = Seq(Owner.withGithub("jakeii"), Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2025, 4, 30),
      participationGroup = Perc0D,
    )

object DCRFootballLive
    extends Experiment(
      name = "dcr-football-live",
      description = "Render football/live in DCR",
      owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2025, 4, 10),
      participationGroup = Perc0E,
    )

object FiveFourImages
    extends Experiment(
      name = "ab-five-four-images",
      description = "Compare 5:4 vs 5:3 aspect ratio in article images",
      owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2025, 3, 20),
      participationGroup = Perc0C,
    )
