import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';
import { Observable } from 'rxjs';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import InvalidArgumentError from '../../../common/error/errors/invalid-argument-error';
import MissingDataError from '../../../common/error/errors/missing-data-error';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { createPaymentClient, createPaymentStrategyRegistry, PaymentActionCreator, PaymentMethod, PaymentMethodActionCreator } from '../../../payment';
import { getMasterpass, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { Masterpass, MasterpassScriptLoader } from '../../../payment/strategies/masterpass';
import { getMasterpassScriptMock } from '../../../payment/strategies/masterpass/masterpass.mock';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import PaymentStrategy from '../payment-strategy';

import MasterpassPaymentStrategy from './masterpass-payment-strategy';

describe('MasterpassPaymentStrategy', () => {
    let container: HTMLDivElement;
    let walletButton: HTMLAnchorElement;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentStrategyActionCreator: PaymentStrategyActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodMock: PaymentMethod;
    let orderActionCreator: OrderActionCreator;
    let store: CheckoutStore;
    let strategy: PaymentStrategy;
    let masterpassScriptLoader: MasterpassScriptLoader;
    let masterpass: Masterpass;
    let requestSender: RequestSender;
    let scriptLoader: ScriptLoader;

    beforeEach(() => {
        paymentMethodMock = { ...getMasterpass(), initializationData: { digitalSessionId: 'digitalSessionId', merchantRequestId: '1234567890' } };
        scriptLoader = createScriptLoader();

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        jest.spyOn(store, 'dispatch')
            .mockReturnValue(Promise.resolve(store.getState()));

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue(paymentMethodMock);

        masterpass = getMasterpassScriptMock();

        masterpassScriptLoader = new MasterpassScriptLoader(createScriptLoader());

        jest.spyOn(masterpassScriptLoader, 'load')
            .mockReturnValue(Promise.resolve(masterpass));
        jest.spyOn(masterpass, 'checkout')
            .mockReturnValue(true);

        requestSender = createRequestSender();

        const paymentClient = createPaymentClient(store);
        const registry = createPaymentStrategyRegistry(store, paymentClient, requestSender);
        const _requestSender: PaymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);

        paymentMethodActionCreator = new PaymentMethodActionCreator(_requestSender);
        orderActionCreator = new OrderActionCreator(paymentClient, new CheckoutValidator(new CheckoutRequestSender(createRequestSender())));
        paymentActionCreator = new PaymentActionCreator(new PaymentRequestSender(paymentClient), orderActionCreator);
        paymentStrategyActionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);

        jest.spyOn(paymentStrategyActionCreator, 'widgetInteraction');

        strategy = new MasterpassPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            masterpassScriptLoader
        );

        container = document.createElement('div');
        walletButton = document.createElement('a');
        container.setAttribute('id', 'login');
        walletButton.setAttribute('id', 'mockButton');
        document.body.appendChild(container);
        document.body.appendChild(walletButton);

        jest.spyOn(walletButton, 'addEventListener');
        jest.spyOn(walletButton, 'removeEventListener');
    });

    afterEach(() => {
        document.body.removeChild(container);
        document.body.removeChild(walletButton);
    });

    it('creates an instance of MasterpassPaymentStrategy', () => {
        expect(strategy).toBeInstanceOf(MasterpassPaymentStrategy);
    });

    describe('#initialize()', () => {
        let masterpassOptions: PaymentInitializeOptions;

        beforeEach(() => {
            masterpassOptions = { methodId: 'masterpass', masterpass: {} };
        });

        it('loads masterpass in test mode if enabled', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith(true);
        });

        it('loads masterpass in test mode if enabled', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith(true);
        });

        it('loads masterpass without test mode if disabled', async () => {
            paymentMethodMock.config.testMode = false;

            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith(false);
        });

        it('does not load masterpass if initialization options are not provided', async () => {
            masterpassOptions = { methodId: 'masterpass'};
            expect(() => strategy.initialize(masterpassOptions)).toThrowError(InvalidArgumentError);
            expect(masterpassScriptLoader.load).not.toHaveBeenCalled();
        });

        it('does not load masterpass if initialization data is not provided', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
                .mockReturnValue(undefined);
            try {
                await strategy.initialize(masterpassOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
                expect(masterpassScriptLoader.load).not.toHaveBeenCalled();

            }
        });

        it('does not load masterpass if store config is not provided', async () => {
            jest.spyOn(store.getState().config, 'getStoreConfig')
                .mockReturnValue(undefined);
            try {
                await strategy.initialize(masterpassOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
                expect(masterpassScriptLoader.load).not.toHaveBeenCalled();

            }
        });

        it('does not load masterpass if checkout is not provided', async () => {
            jest.spyOn(store.getState().config, 'getStoreConfig')
                .mockReturnValue(undefined);
            try {
                await strategy.initialize(masterpassOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
                expect(masterpassScriptLoader.load).not.toHaveBeenCalled();

            }
        });
    });

    describe('#execute()', () => {
        let masterpassOptions: PaymentInitializeOptions;
        let orderRequestBody: OrderRequestBody;
        let submitOrderAction: Observable<Action>;
        let submitPaymentAction: Observable<Action>;

        beforeEach(async () => {
            orderRequestBody = getOrderRequestBody();
            submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));
            submitPaymentAction = Observable.of(createAction(PaymentActionType.SubmitPaymentRequested));
            masterpassOptions = { methodId: 'masterpass', masterpass: {} };
            paymentMethodMock.initializationData = {
                paymentCryptogram: '11111111111111',
                eci: '11111111111',
                reqTokenId: '111111111',
                expDate: '11/11',
                accountNum: '1111',
                accountMask: '1111',
                transactionId: 'MTExMTExMTEx',
            };

            paymentActionCreator.submitPayment = jest.fn(() => submitPaymentAction);
            orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);
            await strategy.initialize(masterpassOptions);
        });

        it('fails to submit order when payment is not provided', async () => {
            orderRequestBody.payment = undefined;
            expect(() => strategy.execute(orderRequestBody, masterpassOptions)).toThrowError(InvalidArgumentError);
        });

        it('calls submit order with the order request information', async () => {
            await strategy.execute(orderRequestBody, masterpassOptions);
            const { payment, ...order } = orderRequestBody;

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, expect.any(Object));
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('calls submit order with the order request information', async () => {
            await strategy.execute(orderRequestBody, masterpassOptions);
            const { payment, ...order } = orderRequestBody;

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, expect.any(Object));
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('pass the options to submitOrder', async () => {
            await strategy.execute(orderRequestBody, masterpassOptions);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(expect.any(Object), masterpassOptions);
        });
    });

    describe('#deinitialize()', () => {
        let masterpassOptions: PaymentInitializeOptions;
        let submitOrderAction: Observable<Action>;

        beforeEach(async () => {
            masterpassOptions = { methodId: 'masterpass', masterpass: {} };
            submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));
            orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);
            await strategy.initialize(masterpassOptions);
        });

        it('expect to not call the orderActionCreator', async () => {
            await strategy.deinitialize(masterpassOptions);

            expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
        });

        it('deinitializes strategy', async () => {
            await strategy.deinitialize();
            expect(await strategy.deinitialize()).toEqual(store.getState());
        });

    });

});
