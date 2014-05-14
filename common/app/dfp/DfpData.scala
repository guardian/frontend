package dfp

case class Target(name: String, op: String, values: Seq[String])

case class TargetSet(op: String, targets: Seq[Target])

case class Ad(id: Long, targetSets: Seq[TargetSet])

case class DfpData(lineItems: Seq[Ad])
