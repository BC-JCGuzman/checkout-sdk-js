import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { Action } from '@bigcommerce/data-store';
import createAction from '@bigcommerce/data-store/lib/create-action';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { Observable } from 'rxjs';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender } from '../../../order';
import {
    PaymentActionCreator, PaymentInitializeOptions, PaymentMethod,
    PaymentMethodActionCreator, PaymentMethodActionType,
    PaymentMethodRequestSender,
    PaymentRequestSender
} from '../../index';
import { getMasterpass, getPaymentMethodsState, getStripe } from '../../payment-methods.mock';

import { Masterpass, MasterpassPaymentStrategy, MasterpassScriptLoader } from './index';
import { getMasterpassScriptMock } from './masterpass.mock';
import { PaymentActionType } from '../../payment-actions';

describe('MasterpassPaymentStragegy', () => {
    // Described class
    let strategy: MasterpassPaymentStrategy;

    // Strategy Constructor arguments dependencies
    let orderRequestSender: OrderRequestSender;
    let requestSender: RequestSender;

    // Strategy constructor arguments
    let store: CheckoutStore;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let scriptLoader: MasterpassScriptLoader;

    // Helper variables
    let initOptions: PaymentInitializeOptions;
    let paymentMethodMock: PaymentMethod;
    let stripePaymentMethodMock: PaymentMethod;
    let masterpassScript: Masterpass;
    let paymentData: any;
    let onPaymentSelectMock: any;

    beforeEach(() => {
        paymentData = { nonce: 'nonce123' };
        onPaymentSelectMock = jest.fn();

        // Strategy's constructor dependencies
        requestSender = createRequestSender();
        orderRequestSender = new OrderRequestSender(createRequestSender());

        // Strategy's constructor arguments
        store = createCheckoutStore({
            checkout: getCheckoutState(),
            config: getConfigState(),
            customer: getCustomerState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        paymentMethodMock = getMasterpass();
        stripePaymentMethodMock = getStripe();

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(paymentMethodMock);

        orderActionCreator = new OrderActionCreator(orderRequestSender, new CheckoutValidator(new CheckoutRequestSender(createRequestSender())));
        paymentActionCreator = new PaymentActionCreator(new PaymentRequestSender(createPaymentClient()), orderActionCreator);
        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender));

        scriptLoader = new MasterpassScriptLoader(createScriptLoader());
        masterpassScript = getMasterpassScriptMock();
        jest.spyOn(scriptLoader, 'load').mockReturnValue(Promise.resolve(masterpassScript));
        jest.spyOn(masterpassScript, 'checkout').mockReturnValue(true);

        // Strategy
        strategy = new MasterpassPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            scriptLoader
        );
    });

    describe('#initialize()', () => {
        beforeEach(() => {
            initOptions = {
                methodId: 'masterpass',
                masterpass: {
                    onPaymentSelect: onPaymentSelectMock,
                    // gateway: 'stripe',
                },
            };
        });

        it('throws an invalid argument exception when masterpass options is missing', () => {
            expect(() => strategy.initialize({ methodId: 'masterpass' })).toThrowError(InvalidArgumentError);
        });

        it('throws an exception if checkout data is missing', async () => {
            jest.spyOn(store.getState().checkout, 'getCheckout').mockReturnValue(null);
            const error = 'Unable to proceed because checkout data is unavailable.';
            await expect(strategy.initialize(initOptions)).rejects.toThrow(error);
        });

        it('throws an exception if store config is missing', async () => {
            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue(null);
            const error = 'Unable to proceed because configuration data is unavailable.';
            await expect(strategy.initialize(initOptions)).rejects.toThrow(error);
        });

        it('throws an exception if payment method initialization data is missing', async () => {
            paymentMethodMock.initializationData = null;
            const error = 'Unable to proceed because payment method data is unavailable or not properly configured.';
            await expect(strategy.initialize(initOptions)).rejects.toThrow(error);
        });

        it('loads the script and call the checkout method when initializing the strategy', async () => {
            await strategy.initialize(initOptions);
            expect(scriptLoader.load).toHaveBeenLastCalledWith(false);
            expect(masterpassScript.checkout).toHaveBeenCalled();
            expect(onPaymentSelectMock).not.toHaveBeenCalled();
        });

        it('loads the script and call the checkout method when initializing the strategy (testMode)', async () => {
            paymentMethodMock.config.testMode = true;
            await strategy.initialize(initOptions);
            expect(scriptLoader.load).toHaveBeenLastCalledWith(true);
            expect(masterpassScript.checkout).toHaveBeenCalled();
            expect(onPaymentSelectMock).not.toHaveBeenCalled();
        });

        describe('widget', () => {
            it('call the onPaymentSelect callback when payment data it is present', async () => {
                paymentMethodMock.initializationData.paymentData = paymentData;
                await strategy.initialize(initOptions);
                expect(scriptLoader.load).not.toHaveBeenCalled();
                expect(onPaymentSelectMock).toHaveBeenCalled();
            });
        });
    });

    describe('#execute', () => {
        let payload: any;
        let submitOrderAction: Observable<Action>;
        let submitPaymentAction: Observable<Action>;
        let loadPaymentMethodAction: Observable<Action>;

        beforeEach(() => {
                paymentData = { nonce: 'nonce123' };
                initOptions = {
                    methodId: 'masterpass',
                    masterpass: {
                        onPaymentSelect: onPaymentSelectMock,
                        gateway: 'stripe',
                    },
                };

                payload = {
                    useStoreCredit: true,
                    payment: {
                        gatewayId: null,
                        methodId: 'masterpass',
                        paymentData: {
                            nonce: 'nonce123',
                        },
                    },
                };

                // Submit Order
                submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));
                orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);

                // Load Payment Method
                loadPaymentMethodAction = Observable.of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, stripePaymentMethodMock, { methodId: stripePaymentMethodMock.id }));
                jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(loadPaymentMethodAction);

                // Submit Payment
                submitPaymentAction = Observable.of(createAction(PaymentActionType.SubmitPaymentRequested));
                paymentActionCreator.submitPayment = jest.fn(() => submitPaymentAction);
            }
        );

        it('fails to submit order when payment is not provided', async () => {
            payload.payment = undefined;
            expect(() => strategy.execute(payload)).toThrowError(InvalidArgumentError);
        });

        it('calls submit order with the order request information', async () => {
            paymentMethodMock.initializationData.paymentData = paymentData;
            await strategy.initialize(initOptions);
            await strategy.execute(payload);

            const { payment, ...order } = payload;

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, expect.any(Object));
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });
    });
});
