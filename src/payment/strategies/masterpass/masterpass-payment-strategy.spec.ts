import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError } from '../../../common/error/errors';
import { getConfigState } from '../../../config/configs.mock';
import { OrderActionCreator, OrderRequestSender } from '../../../order';
import {
    PaymentActionCreator, PaymentInitializeOptions, PaymentMethod,
    PaymentMethodActionCreator,
    PaymentMethodRequestSender,
    PaymentRequestSender
} from '../../index';
import { getMasterpass, getPaymentMethodsState } from '../../payment-methods.mock';

import { Masterpass, MasterpassPaymentStrategy, MasterpassScriptLoader } from './index';
import { getCartState } from '../../../cart/carts.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { getMasterpassScriptMock } from './masterpass.mock';

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
                },
            };
        });

        it('throws an invalid argument exception when masterpass options is missing', () => {
            expect(() => strategy.initialize({ methodId: 'masterpass' })).toThrowError(InvalidArgumentError);
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
});
