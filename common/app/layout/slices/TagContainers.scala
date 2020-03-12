package layout.slices

object TagContainers {

  import ContainerDefinition.{ofSlices => slices}

  def allTagPageSlices(n: Int): ContainerDefinition = n match {
    case 1 => slices(FullMedia100)
    case 2 => slices(HalfHalf2)
    case 3 => slices(TTT)
    case _ => slices(QuarterQuarterQuarterQuarter,
      TlTlTl,
      TlTlTl,
      TlTlTl,
      TlTlTl,
      TlTlTl,
      TlTlTl,
      TlTlMpu)
  }

  val tagPage = slices(
    HalfQQ,
    QuarterQuarterQuarterQuarter,
    TlTlTl,
    TlTlMpu
  )

  val contributorTagPage =  slices(
    HalfQl4Ql4,
    TlTlTl,
    TlTlTl,
    TlTlMpu
  )

  val keywordPage = slices(
    TTT,
    TlTlTl,
    TlTlTl,
    TlTlMpu
  )
}
