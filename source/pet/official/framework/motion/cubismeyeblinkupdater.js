import { ICubismUpdater, CubismUpdateOrder } from './icubismupdater';
export class CubismEyeBlinkUpdater extends ICubismUpdater {
    _motionUpdated;
    _eyeBlink;
    constructor(motionUpdated, eyeBlink, executionOrder) {
        super(executionOrder ?? CubismUpdateOrder.CubismUpdateOrder_EyeBlink);
        this._motionUpdated = motionUpdated;
        this._eyeBlink = eyeBlink;
    }
    onLateUpdate(model, deltaTimeSeconds) {
        if (!model) {
            return;
        }
        if (!this._motionUpdated()) {
            this._eyeBlink.updateParameters(model, deltaTimeSeconds);
        }
    }
}
import * as $ from './cubismeyeblinkupdater';
export var Live2DCubismFramework;
(function (Live2DCubismFramework) {
    Live2DCubismFramework.CubismEyeBlinkUpdater = $.CubismEyeBlinkUpdater;
})(Live2DCubismFramework || (Live2DCubismFramework = {}));
