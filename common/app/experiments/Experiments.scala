package experiments

import conf.switches.{Owner, SwitchGroup}
import experiments.ParticipationGroups._
import org.joda.time.LocalDate
import conf.switches.Owner.group
import conf.switches.SwitchGroup.Commercial

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    LiveblogRendering,
    HideAnniversaryAtom,
    PrebidWithPermutive,
  )

  implicit val canCheckExperiment = new CanCheckExperiment(this)
}

object LiveblogRendering
    extends Experiment(
      name = "liveblog-rendering",
      description = "Use DCR for liveblogs",
      owners = Seq(Owner.withGithub("shtukas")),
      sellByDate = new LocalDate(2021, 8, 2),
      participationGroup = Perc0A,
    )

object HideAnniversaryAtom
    extends Experiment(
      name = "hide-anniversary-atom",
      description =
        "Controls the visibility of the the Anniversary interactive atom on articles. If OPTED IN, will NOT show banner.",
      owners = Seq(Owner.withGithub("gtrufitt")),
      sellByDate = new LocalDate(2022, 5, 11),
      participationGroup = Perc0D,
    )

object NewsletterEmbedDesign
    extends Experiment(
      name = "new-newsletter-embed-designs",
      description = "New newsletter signup embeds for discoverability OKR",
      owners = Seq(Owner.withGithub("buck06191")),
      sellByDate = new LocalDate(2020, 11, 30),
      participationGroup = Perc20A,
    )

object PrebidWithPermutive
  extends Experiment(
    name = "prebid-with-permutive",
    description = "Enables permutive real-time config for Prebid.js",
    owners = group(Commercial),
    sellByDate = new LocalDate(2021, 6, 1),
    participationGroup = Perc0B,
  )
