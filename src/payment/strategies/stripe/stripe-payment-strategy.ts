import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import CreditCardPaymentStrategy from '../credit-card-payment-strategy';

import { Masterpass, MasterpassCheckoutOptions, StripePaymentInitializeOptions } from './stripe';
import StripeScriptLoader from './stripe-script-loader';

export default class StripePaymentStrategy extends CreditCardPaymentStrategy {
    constructor(
        store: CheckoutStore,
        orderActionCreator: OrderActionCreator,
        paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _scriptLoader: StripeScriptLoader
    ) {
        super(store, orderActionCreator, paymentActionCreator);
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId, stripe } = options;

        // Credit card only
        if (!(stripe && stripe.masterpassEnabled)) {
            return super.initialize(options);
        }

        // Masterpass + Credit Card
        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then( state => {
                const checkout = state.checkout.getCheckout();
                const storeConfig = state.config.getStoreConfig();

                if (!checkout) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                }

                if (!storeConfig) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                }

                const initOptions = {
                    testMode: true,
                    masterpassOptions: {
                        checkoutId: '',
                        allowedCardTypes: ['master, amex, visa'],
                        amount: Number.parseFloat(checkout.subtotal).toFixed(2),
                        currency: storeConfig.currency.code,
                        cartId: 'cart123',
                    },
                };

                return initOptions;
            })
            .then(initOptions => {
                return Promise.all([this._scriptLoader.load(initOptions.testMode), Promise.resolve(initOptions.masterpassOptions)]);
            })
            .then(([masterpass, masterPassOptions]) => {
                this._initializeMasterpassButton(stripe.masterpassContainer, masterpass, masterPassOptions);
            })
            .then(() => super.initialize(options));
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return super.execute(payload, options);
    }

    private _initializeMasterpassButton(container: string, masterpass: Masterpass, masterPassOptions: MasterpassCheckoutOptions) {
        const containerElement = document.getElementById(container);
        const buttonHtml = '<a><img id="mpbutton" src="https://static.masterpass.com/dyn/img/btn/global/mp_chk_btn_147x034px.svg"/></a>';
        if (!containerElement) {
            throw new InvalidArgumentError('Unable to create Masterpass button for stripe form due container is missing.');
        }
        containerElement.innerHTML = buttonHtml;
        containerElement.addEventListener('click', () => {
            masterpass.checkout(masterPassOptions);
        });
    }
}
