import { ICubismUpdater, CubismUpdateOrder } from './icubismupdater';
export class CubismBreathUpdater extends ICubismUpdater {
    _breath;
    constructor(breath, executionOrder) {
        super(executionOrder ?? CubismUpdateOrder.CubismUpdateOrder_Breath);
        this._breath = breath;
    }
    onLateUpdate(model, deltaTimeSeconds) {
        if (!model) {
            return;
        }
        this._breath.updateParameters(model, deltaTimeSeconds);
    }
}
import * as $ from './cubismbreathupdater';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismBreathUpdater = $.CubismBreathUpdater;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
