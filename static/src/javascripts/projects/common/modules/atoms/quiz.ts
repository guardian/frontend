
import bean from "bean";
import fastdom from "lib/fastdom-promise";

// find a bucket message to show once you finish a quiz
const handleCompletion = (): void => {
  // we're only handling completion in browsers who can validate forms natively
  // others do a round trip to the server
  if (!HTMLFormElement.prototype.checkValidity) {
    return;
  }

  // quizzes can be set to only show answers at the end, in which case we do a round trip.
  // we'll run this code only if it's an instant-reveal quiz
  const quizzes: Element[] = Array.from(document.getElementsByClassName('js-atom-quiz--instant-reveal'));

  if (!quizzes.length) {
    return;
  }

  bean.on(document, 'click', quizzes, function onClick(e: Event): void {
    const quiz: HTMLFormElement = (e.currentTarget as any);
    let total: number = quiz.querySelectorAll(':checked + .atom-quiz__answer__item--is-correct').length;

    if (!quiz.checkValidity()) {
      // the form (quiz) is complete
      return;
    }

    do {
      // try and find a .bucket__message for your total
      const bucketMessage: HTMLElement | null | undefined = (quiz.querySelector(`.js-atom-quiz__bucket-message--${total}`) as any | null | undefined);

      // if we find a message for your total show it, and exit
      if (bucketMessage) {
        fastdom.write(() => {
          bucketMessage.style.display = 'block';
        });
        bean.off(document, 'click', onClick);
        break;
      }

      // if we haven't exited, there's no .bucket__message for your score, so you must be in
      // a bucket with a range that begins below your total score
      total -= 1;
    } while (total >= 0); // the lowest we'll look is for 0 correct answers
  });
};

export { handleCompletion };