import layout.cards._
import org.scalacheck.{Gen, Arbitrary}
import Arbitrary.arbitrary
import Gen.const

package object layout {
  val cardTypeGen: Gen[CardType] = Gen.oneOf(
    const(MediaList),
    const(ListItem),
    const(Standard),
    const(Half),
    const(ThreeQuarters),
    const(ThreeQuartersRight),
    const(FullMedia75),
    const(FullMedia50),
    const(Third),
    const(FullMedia100),
  )

  val itemLayoutGen = for {
    cls1 <- cardTypeGen
    cls2 <- cardTypeGen
  } yield ItemClasses(cls1, cls2)

  val singleItemGen = for {
    layout <- itemLayoutGen
    width <- Gen.choose(1, 4)
  } yield SingleItem(width, layout)

  val rowGen = for {
    layout <- itemLayoutGen
    rows <- Gen.choose(1, 4)
    columns <- Gen.choose(1, 4)
    width <- Gen.choose(1, 4)
  } yield Rows(width, columns, rows, layout)

  val splitColumnGen = for {
    width <- Gen.choose(1, 4)
    topLayoutRows <- Gen.choose(1, 3)
    topLayout <- itemLayoutGen
    bottomLayoutRows <- Gen.choose(1, 3)
    bottomLayout <- itemLayoutGen
  } yield SplitColumn(width, topLayoutRows, topLayout, bottomLayoutRows, bottomLayout)

  val mpuGen = for {
    width <- Gen.choose(1, 4)
  } yield MPU(width)

  val columnGen = Gen.oneOf(singleItemGen, rowGen, splitColumnGen, mpuGen)

  implicit val arbitrarySlice = Arbitrary {
    for {
      id <- arbitrary[String]
      numberOfCols <- Gen.choose(1, 4)
      columns <- Gen.listOfN(numberOfCols, columnGen)
    } yield SliceLayout(id, columns)
  }
}
