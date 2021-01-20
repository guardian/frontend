package concurrent

import scala.concurrent.{ExecutionContext, Future}

case class FutureOpt[A](self: Future[Option[A]]) {

  def map[B](f: A => B)(implicit ex: ExecutionContext): FutureOpt[B] = FutureOpt(self.map(_ map f))

  def flatMap[B](f: A => FutureOpt[B])(implicit ex: ExecutionContext): FutureOpt[B] =
    FutureOpt {
      for {
        optA <- self
        optB <- Future.traverse(optA.toList)(f andThen (_.self))
      } yield optB.headOption.flatten
    }

  def getOrElse(a: => A)(implicit ex: ExecutionContext): Future[A] = self.map(_.getOrElse(a))

  def orElse(a: => Option[A])(implicit ex: ExecutionContext): FutureOpt[A] = FutureOpt(self.map(_ orElse a))
}

object FutureOpt {
  def fromFuture[A](a: Future[A])(implicit ex: ExecutionContext): FutureOpt[A] = FutureOpt(a.map(Option(_)))
  def fromOpt[A](a: Option[A]): FutureOpt[A] = FutureOpt(Future.successful(a))
  def fromValue[A](a: A): FutureOpt[A] = FutureOpt(Future.successful(Option(a)))
}
