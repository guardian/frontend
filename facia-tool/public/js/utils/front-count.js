import {CONST} from 'modules/vars';
import _ from 'underscore';

export default function countFronts (fronts, priority) {
    priority = priority || CONST.defaultPriority;

    return {
        count: _.countBy(_.values(fronts), function (front) {
            return front.priority || CONST.defaultPriority;
        })[priority] || 0,
        max: CONST.maxFronts[priority] || Infinity
    };
}
