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
    private _paymentMethod?: PaymentMethod;

    constructor(
        store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _masterpassScriptLoader: MasterpassScriptLoader
    ) {
        super(store);
        this._masterpassCheckoutCallback = () => {
        };
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        console.log('Initialize...');
        this._methodId = options.methodId;

        if (!options.masterpass) {
            throw new InvalidArgumentError('Unable to initialize payment because masterpass options is missing');
        }

        // Widget update callback
        if (this._hasPaymentInfo()) {
            if (options.masterpass.onPaymentSelect) {
                options.masterpass.onPaymentSelect();
            }
        }

        return Promise.resolve(this._hasPaymentInfo()).then(hasPaymentInfo => {
            if (hasPaymentInfo) {
                return this._walletSetup().then(() => { this._masterpassCheckoutCallback(); });
            }
        }).then(() => {
            return super.initialize(options);
        }) ;
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        this._masterpassCheckoutCallback = () => {
        };
        this._masterpassClient = {} as Masterpass;
        this._onPaymentSelected = undefined;
        this._paymentMethod = undefined;

        return super.deinitialize(options);
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!(payment && payment.paymentData)) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        const paymentData = payment.paymentData;
        // @ts-ignore
        const methodId = paymentData.extraData;

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
        return this._paymentMethod && this._paymentMethod.initializationData && this._paymentMethod.initializationData.nonce;
    }

    private _walletSetup(): Promise<void> {
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
            .then(masterpassClient => {
                this._masterpassCheckoutCallback = () => {
                    masterpassClient.checkout(payload);
                };
            });
    }
}
