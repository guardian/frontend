package dfp

case class DfpData(sponsoredKeywords: Seq[String], advertisedFeatureKeywords: Seq[String])

case class Target(name: String, op: String, values: Seq[String])

case class TargetSet(op: String, targets: Seq[Target])
