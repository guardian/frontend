package model.content

import com.gu.contentapi.client.model.{v1 => contentapi}

sealed trait Atom

object Quiz {
  def make(atom: contentapi.QuizAtom): Quiz = {
    Quiz(id = atom.id)
  }
}
final case class Quiz(
  id: String
) extends Atom

object Atoms {
  def make(content: contentapi.Content): Option[Atoms] = {
    content.atoms.map { atoms =>
      Atoms(quizzes = atoms.quiz.map(Quiz.make).toList)
    }
  }
}

final case class Atoms(
  quizzes: Seq[Quiz]
) {
  lazy val all: Seq[Atom] = quizzes
}