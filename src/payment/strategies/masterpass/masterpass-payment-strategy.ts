import { Checkout, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType
} from '../../../common/error/errors';
import { StoreConfig } from '../../../config';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { PaymentArgumentInvalidError } from '../../errors';
import { PaymentMethod, PaymentMethodActionCreator } from '../../index';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { MasterpassCheckoutCallback, MasterpassCheckoutOptions, MasterpassScriptLoader } from './index';

export default class MasterpassPaymentStrategy extends PaymentStrategy {
    private _masterpassCheckoutCallback: MasterpassCheckoutCallback;
    private _onPaymentSelected: any;
    private _testMode?: boolean;
    private _paymentMethod?: PaymentMethod;

    constructor(
        store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _masterpassScriptLoader: MasterpassScriptLoader
    ) {
        super(store);
        this._testMode = true;
        this._masterpassCheckoutCallback = () => {
        };
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        console.log('==> PaymentStrategy initialize...');
        const { methodId, gatewayId, masterpass: masterpassOptions } = options;
        console.dir(options);

        if (!masterpassOptions) {
            throw new InvalidArgumentError('Unable to initialize paymen because options.masterpass is missing');
        }

        // Widget update callback
        this._onPaymentSelected = masterpassOptions.onPaymentSelect;

        // const paymentMethod: Observable<LoadPaymentMethodAction> = this._paymentMethodActionCreator.loadPaymentMethod(methodId);
        const state = this._store.getState();
        this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
        console.log(`MethodId: ${methodId}`);
        const checkout = state.checkout.getCheckout();
        const storeConfig = state.config.getStoreConfig();

        if (!checkout) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckout);
        }

        if (!storeConfig) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        if (!(this._paymentMethod && this._paymentMethod.initializationData)) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        // Retrieve test mode
        this._testMode = this._paymentMethod.config.testMode;

        return Promise.all([this._masterpassScriptLoader.load(this._testMode), this._masterPassCheckoutOptions(this._paymentMethod, checkout, storeConfig)])
            .then(([masterpassJsClient, masterpassCheckoutOptions]) => {
                this._masterpassCheckoutCallback = () => {
                    masterpassJsClient.checkout(masterpassCheckoutOptions);
                };
            })
            .then(() => super.initialize(options))
            .then(state => {
                if (this._paymentMethod && this._paymentMethod.initializationData && this._paymentMethod.initializationData.nonce) {
                    this._onPaymentSelected();
                } else {
                    this._masterpassCheckoutCallback();
                }
                return state;
            });
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;

        if (!payment || !paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() => {
                debugger;
                console.log('Submit payment from strategy...');
                return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod('stripe'))
                    .then(() => this._store.dispatch(this._paymentActionCreator.submitPayment({ methodId: 'stripe', paymentData })));
                }
            );
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

export interface MasterpassPaymentInitializeOptions {
    onError?(error: Error): void;
    onPaymentSelect?(): void;
}
