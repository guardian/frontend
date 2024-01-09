package layout.slices

import conf.Configuration

object FixedContainers {
  import ContainerDefinition.{ofSlices => slices}

  //TODO: Temporary vals for content until we refactor
  val fixedSmallSlowI: ContainerDefinition = slices(FullMedia75)
  val fixedSmallSlowII: ContainerDefinition = slices(HalfHalf)
  val fixedSmallSlowIV: ContainerDefinition = slices(QuarterQuarterQuarterQuarter)
  val fixedSmallSlowVI: ContainerDefinition = slices(TTTL4)
  val fixedSmallSlowVThird: ContainerDefinition = slices(QuarterQuarterHl3)
  val fixedMediumSlowVI: ContainerDefinition = slices(ThreeQuarterQuarter, QuarterQuarterQuarterQuarter)
  val fixedMediumSlowVII: ContainerDefinition = slices(HalfQQ, QuarterQuarterQuarterQuarter)
  val fixedMediumSlowVIII: ContainerDefinition = slices(Seq(TTMpu, TlTlTl), slicesWithoutMpu = Seq(TTT, TlTlTl))
  val fixedMediumSlowXIIMpu: ContainerDefinition = slices(Seq(TTT, TlTlMpu), slicesWithoutMpu = Seq(TTT, TlTlTl))
  val fixedMediumFastXI: ContainerDefinition = slices(HalfQQ, Ql2Ql2Ql2Ql2)
  val fixedMediumFastXII: ContainerDefinition = slices(QuarterQuarterQuarterQuarter, Ql2Ql2Ql2Ql2)

  val fastIndexPageMpuII: ContainerDefinition = slices(TTMpu)
  val fastIndexPageMpuIV: ContainerDefinition = slices(TTlMpu)
  val fastIndexPageMpuVI: ContainerDefinition = slices(TlTlMpu)
  val fastIndexPageMpuIX = fixedMediumSlowXIIMpu

  val slowIndexPageMpuII: ContainerDefinition = slices(TTMpu)
  val slowIndexPageMpuIV: ContainerDefinition = slices(HalfHalf2, TTMpu)
  val slowIndexPageMpuV: ContainerDefinition = slices(TTT, TTMpu)
  val slowIndexPageMpuVII: ContainerDefinition = slices(HalfHalf2, TTT, TTMpu)

  val slowSeriesIII: ContainerDefinition = slices(TTT)
  val slowSeriesV: ContainerDefinition = slices(HalfHalf, TTT)

  val footballTeamFixtures: ContainerDefinition = slices(TTT)

  val thrasher: ContainerDefinition =
    slices(Fluid).copy(customCssClasses = Set("fc-container--thrasher", "flashing-image"))

  val showcaseSingleStories: ContainerDefinition = slices(ShowcaseSingleStories)

  val all: Map[String, ContainerDefinition] = Map(
    ("fixed/small/slow-I", slices(FullMedia75)),
    ("fixed/small/slow-III", slices(HalfQQ)),
    ("fixed/small/slow-IV", fixedSmallSlowIV),
    ("fixed/small/slow-V-half", slices(Hl4Half)),
    ("fixed/small/slow-V-third", fixedSmallSlowVThird),
    ("fixed/small/slow-V-mpu", slices(Seq(TTlMpu), slicesWithoutMpu = Seq(QuarterQuarterQuarterQuarter))),
    ("fixed/small/fast-VIII", slices(QuarterQuarterQlQl)),
    ("fixed/medium/slow-VI", fixedMediumSlowVI),
    ("fixed/medium/slow-VII", fixedMediumSlowVII),
    ("fixed/medium/slow-XII-mpu", fixedMediumSlowXIIMpu),
    ("fixed/medium/fast-XI", fixedMediumFastXI),
    ("fixed/medium/fast-XII", fixedMediumFastXII),
    ("fixed/large/slow-XIV", slices(ThreeQuarterQuarter, QuarterQuarterQuarterQuarter, Ql2Ql2Ql2Ql2)),
    ("fixed/thrasher", thrasher),
    ("fixed/showcase", showcaseSingleStories),
  ) ++ (if (Configuration.faciatool.showTestContainers)
          Map(
            (
              "all-items/not-for-production",
              slices(
                FullMedia100,
                FullMedia75,
                FullMedia50,
                HalfHalf,
                QuarterThreeQuarter,
                ThreeQuarterQuarter,
                Hl4Half,
                HalfQuarterQl2Ql4,
                TTTL4,
                Ql3Ql3Ql3Ql3,
              ),
            ),
          )
        else Map.empty)

  def unapply(collectionType: Option[String]): Option[ContainerDefinition] =
    collectionType.flatMap(all.lift)
}
