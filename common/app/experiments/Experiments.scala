package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._
import java.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    LiveblogRendering,
    InteractiveLibrarianExp,
    StandaloneCommercialBundle,
    StandaloneCommercialBundleTracking,
    RemoveStickyNav
  )

  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object LiveblogRendering
    extends Experiment(
      name = "liveblog-rendering",
      description = "Use DCR for liveblogs",
      owners = Seq(Owner.withGithub("shtukas")),
      sellByDate = LocalDate.of(2021, 11, 30),
      participationGroup = Perc0A,
    )

object InteractiveLibrarianExp
    extends Experiment(
      name = "interactive-librarian",
      description = "The Interactive Librarian private experiment",
      owners = Seq(Owner.withGithub("shtukas")),
      sellByDate = LocalDate.of(2022, 1, 31),
      participationGroup = Perc0B,
    )

object StandaloneCommercialBundle
    extends Experiment(
      name = "standalone-commercial-bundle",
      description = "Serve a standalone commercial bundle to a subset of users",
      owners = Seq(Owner.withGithub("mxdvl")),
      sellByDate = LocalDate.of(2021, 10, 1),
      participationGroup = Perc5A,
    )

object StandaloneCommercialBundleTracking
    extends Experiment(
      name = "standalone-commercial-bundle-tracking",
      description = "Track performance metrics for the standalone commercial bundle",
      owners = Seq(Owner.withGithub("mxdvl")),
      sellByDate = LocalDate.of(2021, 10, 1),
      participationGroup = Perc1A,
    )

object RemoveStickyNav
    extends Experiment(
      name = "remove-sticky-nav",
      description = "Remove sticky behaviour from the nav bar",
      owners = Seq(Owner.withGithub("MarSavar")),
      sellByDate = LocalDate.of(2021, 10, 8),
      participationGroup = Perc1A,
    )
