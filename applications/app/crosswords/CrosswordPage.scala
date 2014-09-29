package crosswords

import model.MetaData

class CrosswordPage(val crossword: CrosswordData) extends MetaData {
  override def id: String = s"crosswords/${crossword.crosswordType}/${crossword.number}"

  override def section: String = "crosswords"

  override def analyticsName: String = id

  override def webTitle: String = crossword.name
}
