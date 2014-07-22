package views.support

object ListTemplate {
  def zipWithIsLast[A](as: Seq[A]): Seq[(A, Boolean)] =
    as.zip(Seq.fill(as.length - 1)(false) :+ true)
}
