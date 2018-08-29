import { ScriptLoader } from '@bigcommerce/script-loader';

import { StandardError } from '../../../common/error/errors';

import { Masterpass, StripeHostWindow } from './stripe';

export default class StripeScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        public _window: StripeHostWindow = window
    ) {}

    load(testMode?: boolean): Promise<Masterpass> {
        return this._scriptLoader
            .loadScript(`//${testMode ? 'sandbox.' : ''}masterpass.com/integration/merchant.js`)
            .then(() => {
                if (!this._window.masterpass) {
                    throw new StandardError();
                }

                return this._window.masterpass;
            });
    }
}
