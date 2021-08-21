package experiments

import conf.switches.Owner
import experiments.ParticipationGroups._
import java.time.LocalDate

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    LiveblogRendering,
    InteractiveLibrarianExp,
    TopAboveNavHeight150,
    TopAboveNavHeight200,
    TopAboveNavHeight250,
    StandaloneCommercialBundle,
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
      description = "Private experiment to develop archiving backup for Interactives",
      owners = Seq(Owner.withGithub("shtukas")),
      sellByDate = LocalDate.of(2021, 8, 31),
      participationGroup = Perc0B,
    )

object TopAboveNavHeight150
    extends Experiment(
      name = "top-above-nav-height-150",
      description = "Set minimum height of top-above-nav ad slot to 150px rather than current height of 90px",
      owners = Seq(Owner.withGithub("zekehuntergreen")),
      sellByDate = LocalDate.of(2021, 8, 31),
      participationGroup = Perc1A,
    )

object TopAboveNavHeight200
    extends Experiment(
      name = "top-above-nav-height-200",
      description = "Set minimum height of top-above-nav ad slot to 200px rather than current height of 90px",
      owners = Seq(Owner.withGithub("zekehuntergreen")),
      sellByDate = LocalDate.of(2021, 8, 31),
      participationGroup = Perc1B,
    )

object TopAboveNavHeight250
    extends Experiment(
      name = "top-above-nav-height-250",
      description = "Set minimum height of top-above-nav ad slot to 250px rather than current height of 90px",
      owners = Seq(Owner.withGithub("zekehuntergreen")),
      sellByDate = LocalDate.of(2021, 8, 31),
      participationGroup = Perc1C,
    )

object StandaloneCommercialBundle
    extends Experiment(
      name = "standalone-commercial-bundle",
      description = "Serve a standalone commercial bundle to a subset of users",
      owners = Seq(Owner.withGithub("mxdvl")),
      sellByDate = LocalDate.of(2021, 10, 1),
      participationGroup = Perc0E,
    )
