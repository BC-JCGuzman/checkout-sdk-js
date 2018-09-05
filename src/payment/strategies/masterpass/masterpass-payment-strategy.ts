import { Observable } from 'rxjs';

import { Checkout, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { StoreConfig } from '../../../config';
import { OrderRequestBody } from '../../../order';
import { LoadPaymentMethodAction, PaymentMethodActionCreator } from '../../index';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { Masterpass, MasterpassCheckoutOptions, MasterpassScriptLoader } from './index';
import { MissingDataError, MissingDataErrorType } from "../../../common/error/errors";

export default class MasterpassPaymentStrategy extends PaymentStrategy {
    constructor(
        store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _masterpassScriptLoader: MasterpassScriptLoader
    ) {
        super(store);
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options;
        const paymentMethod: Observable<LoadPaymentMethodAction> = this._paymentMethodActionCreator.loadPaymentMethod(methodId);
        return this._store.dispatch(paymentMethod)
            .then(state => {
                const checkout = state.checkout.getCheckout();
                const storeConfig = state.config.getStoreConfig();

                if (!checkout) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                }

                if (!storeConfig) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                }

                return this._masterPassCheckoutOptions(checkout, storeConfig);
            })
            .then(masterPassCheckoutOptions => {
                return Promise.all([this._masterpassScriptLoader.load(true), masterPassCheckoutOptions]);
            })
            .then(([masterpass, masterpassCheckoutOptions]) => {
                return this._setupMasterpassButton(masterpass, masterpassCheckoutOptions, 'foo');
            })
            .then(() => super.initialize(options));

        return this._masterpassScriptLoader.load(true)
            .then((masterpass: Masterpass) => {
                console.log(masterpass);
            })
            .then(() => super.initialize(options));
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        console.log('MasterpassPaymentStrategy execute...');
        return super.execute(payload, options);
    }

    private _masterPassCheckoutOptions(checkout: Checkout, storeConfig: StoreConfig): MasterpassCheckoutOptions {
        return {
            checkoutId: '',
            allowedCardTypes: ['master, amex, visa'],
            amount: checkout.subtotal.toFixed(2),
            currency: storeConfig.currency.code,
            cartId: 'cart123',
        };
    }

    private _setupMasterpassButton(masterpass: Masterpass, masterpassOptions: MasterpassCheckoutOptions, elementId: string): void {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('click', () => masterpass.checkout(masterpassOptions));
        }
    }
}
