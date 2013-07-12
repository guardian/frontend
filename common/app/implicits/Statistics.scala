package implicits

trait Statistics {

  implicit class ListIntTuple2WeightedAverage(weightsAndCounts: List[(Int, Int)]) {
    lazy val weightedAverage: Double = {
      val countsSum: Long = (weightsAndCounts map { case (_, count) => count.toLong }).sum
      val weightedCountsSum: Long = (weightsAndCounts map { case (weight, count) => weight.toLong * count }).sum

      weightedCountsSum.toDouble / countsSum
    }
  }
}
