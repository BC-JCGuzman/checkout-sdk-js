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

import {
    Masterpass,
    MasterpassCheckoutCallback,
    MasterpassCheckoutOptions,
    MasterpassPaymentInitializeOptions,
    MasterpassScriptLoader
} from './index';

export default class MasterpassPaymentStrategy extends PaymentStrategy {
    private _masterpassCheckoutCallback: MasterpassCheckoutCallback;
    private _masterpassClient?: Masterpass;
    private _methodId!: string;
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
        this._methodId = options.methodId;

        if (!options.masterpass) {
            throw new InvalidArgumentError('Unable to initialize paymen because options.masterpass is missing');
        }

        // Widget update callback
        this._onPaymentSelected = options.masterpass.onPaymentSelect;

        return this._walletSetup(options.masterpass)
            .then(() => super.initialize(options))
            .then(state => {
                if (this._paymentMethod
                    && this._paymentMethod.initializationData
                    && this._paymentMethod.initializationData.nonce
                ) {
                    this._onPaymentSelected();
                } else {
                    this._masterpassCheckoutCallback();
                }
                return state;
            });
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        this._masterpassCheckoutCallback = () => {};
        this._masterpassClient = {} as Masterpass;
        this._onPaymentSelected = undefined;
        this._paymentMethod = undefined;

        return super.deinitialize(options);
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;

        if (!payment || !paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() => {
                return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(this._methodId))
                    .then(() => this._store.dispatch(this._paymentActionCreator.submitPayment({ methodId: this._methodId, paymentData })));
                }
            );
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

    private _walletSetup(options: MasterpassPaymentInitializeOptions): Promise<void> {
        const state = this._store.getState();
        this._paymentMethod = state.paymentMethods.getPaymentMethod(this._methodId);
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
            .then(Masterpass => {
                this._masterpassClient = Masterpass;
                this._masterpassCheckoutCallback = () => {
                    if (this._masterpassClient) {
                    this._masterpassClient.checkout(payload);
                    }
                };
            });
    }
}
