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
      DCRCrosswords,
      DarkModeWeb,
      UseUserBenefitsApi,
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

object DCRCrosswords
    extends Experiment(
      name = "dcr-crosswords",
      description = "Render crosswords in DCR",
      owners = Seq(Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2025, 2, 26),
      participationGroup = Perc0C,
    )

object DarkModeWeb
    extends Experiment(
      name = "dark-mode-web",
      description = "Enable dark mode on web",
      owners = Seq(Owner.withGithub("jakeii"), Owner.withEmail("dotcom.platform@theguardian.com")),
      sellByDate = LocalDate.of(2025, 1, 30),
      participationGroup = Perc0D,
    )

object UseUserBenefitsApi
    extends Experiment(
      name = "use-user-benefits-api",
      description = "Enable the switch from members-data-api to the new user-benefits API",
      owners = Seq(Owner.withGithub("rupertbates")),
      sellByDate = LocalDate.of(2025, 6, 30),
      participationGroup = Perc50,
    )

// object ConsentOrPayBanner
//     extends Experiment(
//       name = "consent-or-pay-banner",
//       description = "Consent or pay banner",
//       owners = Seq(Owner.withGithub("Transparency.and.consent@guardian.co.uk")),
//       sellByDate = LocalDate.of(2025, 12, 30),
//       participationGroup = Perc0C,
//     )
