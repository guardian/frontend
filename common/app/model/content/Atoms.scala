package model.content

import com.gu.contentapi.client.model.{v1 => contentapi}
import com.gu.contentatom.thrift.{atom => atomapi, AtomData}
import quiz.{QuizContent, Question, Answer, ResultGroup}

final case class Atoms(
  quizzes: Seq[Quiz]
) {
  val all: Seq[Atom] = quizzes
}

sealed trait Atom {
  def id: String
}

final case class Quiz(
  override val id: String,
  title: String,
  path: String,
  quizType: String,
  content: QuizContent
) extends Atom

object Atoms extends common.Logging {
  def make(content: contentapi.Content): Option[Atoms] = {
    content.atoms.map { atoms =>
      val quizzes: Seq[atomapi.quiz.QuizAtom] = try {
        atoms.quizzes.getOrElse(Nil).map(atom => {
          atom.data.asInstanceOf[AtomData.Quiz].quiz
        })
      } catch {
        case e: Exception =>
          logException(e)
          Nil
      }
      Atoms(quizzes = quizzes.map(Quiz.make(content.id, _)))
    }
  }
}

object Quiz {
  def make(path: String, quiz: atomapi.quiz.QuizAtom): Quiz = {
    val questions = quiz.content.questions.map { question =>
      val answers = question.answers.map { answer =>
        Answer(
          text = answer.answerText,
          revealText = answer.revealText.flatMap(revealText => if (revealText != "") Some(revealText) else None),
          weight = answer.weight.toInt)
      }
      Question(
        text = question.questionText,
        answers = answers)
    }

    val content = QuizContent(
      questions = questions,
      resultGroups = quiz.content.resultGroups.map(resultGroups => {
        resultGroups.groups.map(resultGroup => {
          ResultGroup(
            title = resultGroup.title,
            shareText = resultGroup.share,
            minScore = resultGroup.minScore
          )
        })
      }).getOrElse(Nil)
    )

    Quiz(
      id = quiz.id,
      path = path,
      title = quiz.title,
      quizType = quiz.quizType,
      content = content
    )
  }
}
