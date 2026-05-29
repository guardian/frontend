package experiments

/*
 * This list of active experiments is sorted by participation group.
 */
object ActiveExperiments extends ExperimentsDefinition {
  override val allExperiments: Set[Experiment] =
    Set()
  implicit val canCheckExperiment: CanCheckExperiment = new CanCheckExperiment(this)
}
