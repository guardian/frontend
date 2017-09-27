package controllers

import common.ImplicitControllerExecutionContext
import conf.switches.Switches
import model.ApplicationContext
import pages.ContentHtmlPage
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import sudoku.{SudokuApi, SudokuPage}

import scala.concurrent.Future

class SudokusController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
  extends BaseController with ImplicitControllerExecutionContext {
  def render(id: String): Action[AnyContent] = Action.async { implicit request =>
    if (Switches.SudokuSwitch.isSwitchedOn) {
      SudokuApi.getData(id) map {
        case Some(sudokuData) =>
          Ok(ContentHtmlPage.html(new SudokuPage(sudokuData)))

        case None => NotFound(s"No Sudoku with id $id")
      }
    } else {
      Future.successful(NotFound("Sudokus off"))
    }
  }
}
