import { createAction, Action } from '@bigcommerce/data-store';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { Observable } from 'rxjs';

import { createCheckoutStore, CheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentMethodActionType } from '../../payment-method-actions';
import { getStripe } from '../../payment-methods.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';

import { StripePaymentStrategy, StripeScriptLoader } from './index';

describe('StripePaymentStrategy', () => {
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let stripePaymentStrategy: StripePaymentStrategy;
    let paymentMethodMock: PaymentMethod;
    let loadPaymentMethodAction: Observable<Action>;
    let store: CheckoutStore;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;
    let stripeScriptLoader: StripeScriptLoader;

    beforeEach(() => {
        submitPaymentAction = Observable.of(createAction(PaymentActionType.SubmitPaymentRequested));
        paymentMethodMock = getStripe();
        loadPaymentMethodAction = Observable.of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, { paymentMethod: paymentMethodMock }, { methodId: paymentMethodMock.id }));

        store = createCheckoutStore(getCheckoutStoreState());
        jest.spyOn(store, 'dispatch');

        orderActionCreator = {} as OrderActionCreator;
        orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);

        paymentActionCreator = {} as PaymentActionCreator;
        paymentActionCreator.submitPayment = jest.fn(() => submitPaymentAction);

        paymentMethodActionCreator = {} as PaymentMethodActionCreator;
        paymentMethodActionCreator.loadPaymentMethod = jest.fn(() => loadPaymentMethodAction);

        stripeScriptLoader = new StripeScriptLoader(createScriptLoader());

        stripePaymentStrategy = new StripePaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            stripeScriptLoader
        );

        jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(null));
    });

    it('creates an instance of the braintree payment strategy', () => {
        expect(stripePaymentStrategy).toBeInstanceOf(StripePaymentStrategy);
    });

    describe('#initialize()', () => {
        let options: PaymentInitializeOptions;
        beforeEach(() => {
            options = {
                methodId: paymentMethodMock.id,
                stripe: { masterpassEnabled: true, masterpassContainer: '' },
            };
        });

        describe('when masterpass is enabled', () => {
            // TODO: Finish the following test case
            // it('sets the initOptions object correctly', () => {
            //     console.log('');
            // });

            it('loads the masterpass script', async () => {
                jest.spyOn(stripePaymentStrategy, '_initializeMasterpassButton').mockReturnValue(null);
                await stripePaymentStrategy.initialize(options);
                expect(stripeScriptLoader.load).toHaveBeenCalledTimes(1);
            });

            it('adds the masterpass button to the container passed in the options', async () => {
                const buttonHtml = '<a><img id="mpbutton" src="https://static.masterpass.com/dyn/img/btn/global/mp_chk_btn_147x034px.svg"/></a>';
                const containerElement = { innerHTML: '', addEventListener };
                jest.spyOn(containerElement, 'addEventListener');
                jest.spyOn(document, 'getElementById').mockReturnValue(containerElement);
                await stripePaymentStrategy.initialize(options);
                expect(containerElement.innerHTML).toBe(buttonHtml);
                expect(containerElement.addEventListener).toHaveBeenCalledTimes(1);
            });
        });

        describe('when masterpass is not enabled', () => {
            beforeEach(() => {
                options.stripe.masterpassEnabled = false;
            });

            it('does not load the masterpass script', async () => {
                await stripePaymentStrategy.initialize(options);
                expect(stripeScriptLoader.load).not.toHaveBeenCalled();
            });
        });
    });
});
