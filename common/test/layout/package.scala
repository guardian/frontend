import org.scalacheck.{Gen, Arbitrary}
import Arbitrary.arbitrary

package object layout {
  val itemLayoutGen = for {
    cls1 <- arbitrary[String]
    cls2 <- arbitrary[String]
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
    topLayout <- itemLayoutGen
    bottomLayout <- itemLayoutGen
    width <- Gen.choose(1, 4)
  } yield SplitColumn(width, topLayout, bottomLayout)

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
