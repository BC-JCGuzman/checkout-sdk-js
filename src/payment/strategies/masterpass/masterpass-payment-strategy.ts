import { Checkout, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType
} from '../../../common/error/errors';
import { StoreConfig } from '../../../config';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { PaymentArgumentInvalidError } from '../../errors';
import { CreditCardInstrument, PaymentMethod, PaymentMethodActionCreator } from '../../index';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import {
    Masterpass,
    MasterpassCheckoutCallback,
    MasterpassCheckoutOptions,
    MasterpassPaymentInitializeOptions,
    MasterpassScriptLoader
} from './index';

export default class MasterpassPaymentStrategy extends PaymentStrategy {
    private _paymentMethod?: PaymentMethod;

    constructor(
        store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _masterpassScriptLoader: MasterpassScriptLoader
    ) {
        super(store);
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options;

        if (!options.masterpass) {
            throw new InvalidArgumentError('Unable to initialize payment because masterpass options is missing');
        }

        const state = this._store.getState();
        this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

        return Promise.resolve(this._hasPaymentInfo()).then(hasPaymentInfo => {
            if (!hasPaymentInfo) {
                return this._masterpassClientSetup().then(checkoutCallback => checkoutCallback());
            }

            if (options.masterpass && options.masterpass.onPaymentSelect) {
                options.masterpass.onPaymentSelect();
            }
        }).then(() => {
            return super.initialize(options);
        }) ;
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        this._paymentMethod = undefined;

        return super.deinitialize(options);
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!(payment && payment.paymentData)) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        const paymentData = payment.paymentData;
        const methodId = (paymentData as CreditCardInstrument).extraData;

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() => this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId)))
            .then(() => this._store.dispatch(this._paymentActionCreator.submitPayment({ methodId, paymentData })));
    }

    private _createMasterpassPayload(paymentMethod: PaymentMethod, checkout: Checkout, storeConfig: StoreConfig): MasterpassCheckoutOptions {
        return {
            checkoutId: paymentMethod.initializationData.checkoutId,
            allowedCardTypes: paymentMethod.initializationData.allowedCardTypes,
            amount: checkout.subtotal.toFixed(2),
            currency: storeConfig.currency.code,
            cartId: checkout.cart.id,
        };
    }

    private _hasPaymentInfo(): boolean {
        return this._paymentMethod
            && this._paymentMethod.initializationData
            && this._paymentMethod.initializationData.paymentData
            && this._paymentMethod.initializationData.paymentData.nonce;
    }

    private _masterpassClientSetup(): Promise<MasterpassCheckoutCallback> {
        const state = this._store.getState();
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

        const payload = this._createMasterpassPayload(this._paymentMethod, checkout, storeConfig);

        return this._masterpassScriptLoader.load(this._paymentMethod.config.testMode)
            .then(masterpassClient => () => masterpassClient.checkout(payload));
    }
}
