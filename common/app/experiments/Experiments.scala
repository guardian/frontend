package experiments

import conf.switches.{Owner, SwitchGroup}
import experiments.ParticipationGroups._
import org.joda.time.LocalDate
import conf.switches.Owner.group
import conf.switches.SwitchGroup.Commercial

object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] = Set(
    ClickToView,
    LiveblogRendering,
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

object NewsletterEmbedDesign
    extends Experiment(
      name = "new-newsletter-embed-designs",
      description = "New newsletter signup embeds for discoverability OKR",
      owners = Seq(Owner.withGithub("buck06191")),
      sellByDate = new LocalDate(2020, 11, 30),
      participationGroup = Perc20A,
    )

object ClickToView
    extends Experiment(
      name = "click-to-view",
      description = "Click to provide consent before seeing embedded content",
      owners = Seq(Owner.withGithub("frj")),
      sellByDate = new LocalDate(2021, 5, 6),
      participationGroup = Perc0B,
    )
