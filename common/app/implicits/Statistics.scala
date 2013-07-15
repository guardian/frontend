package implicits

trait Statistics extends implicits.Tuples {

  implicit class ListIntTuple2WeightedAverage(weightsAndCounts: List[(Int, Long)]) {
    lazy val weightedAverage: Double = {
      val countsSum: Long = (weightsAndCounts map { _.second }).sum
      val weightedCountsSum: Long = (weightsAndCounts map { case (weight, count) => weight * count }).sum

      weightedCountsSum.toDouble / countsSum
    }
  }
}
