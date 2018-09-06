import { Observable } from 'rxjs';

import { Checkout, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType
} from '../../../common/error/errors';
import { StoreConfig } from '../../../config';
import { OrderRequestBody } from '../../../order';
import { LoadPaymentMethodAction, PaymentMethod, PaymentMethodActionCreator } from '../../index';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { MasterpassCheckoutCallback, MasterpassCheckoutOptions, MasterpassScriptLoader } from './index';

export default class MasterpassPaymentStrategy extends PaymentStrategy {
    private _masterpassCheckoutCallback?: MasterpassCheckoutCallback;
    private _testMode?: boolean;

    constructor(
        store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _masterpassScriptLoader: MasterpassScriptLoader
    ) {
        super(store);
        this._testMode = true;
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options;
        const paymentMethod: Observable<LoadPaymentMethodAction> = this._paymentMethodActionCreator.loadPaymentMethod(methodId);
        return this._store.dispatch(paymentMethod)
            .then(state => {
                const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
                const checkout = state.checkout.getCheckout();
                const storeConfig = state.config.getStoreConfig();

                if (!checkout) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                }

                if (!storeConfig) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                }

                if (!(paymentMethod && paymentMethod.initializationData && paymentMethod.initializationData.checkoutId)) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                this._testMode = paymentMethod.config.testMode;

                return this._masterPassCheckoutOptions(paymentMethod, checkout, storeConfig);
            })
            .then(masterPassCheckoutOptions => {
                return Promise.all([this._masterpassScriptLoader.load(this._testMode), masterPassCheckoutOptions]);
            })
            .then(([masterpassJsClient, masterpassCheckoutOptions]) => {
                this._masterpassCheckoutCallback = () => {
                    masterpassJsClient.checkout(masterpassCheckoutOptions);
                };
            })
            .then(() => super.initialize(options))
            .then(state => {
                if (this._masterpassCheckoutCallback) {
                    this._masterpassCheckoutCallback();
                }
                return state;
            });
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        // @ts-ignore
        return null;
    }

    private _masterPassCheckoutOptions(paymentMethod: PaymentMethod, checkout: Checkout, storeConfig: StoreConfig): MasterpassCheckoutOptions {
        return {
            checkoutId: paymentMethod.initializationData.checkoutId,
            allowedCardTypes: paymentMethod.initializationData.allowedCardTypes,
            amount: checkout.subtotal.toFixed(2),
            currency: storeConfig.currency.code,
            cartId: checkout.cart.id,
        };
    }
}
