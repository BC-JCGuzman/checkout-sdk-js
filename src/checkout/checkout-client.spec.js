import { createTimeout } from '@bigcommerce/request-sender';
import { getResponse } from '../common/http-request/responses.mock';
import { getBillingAddress } from '../billing/internal-billing-addresses.mock';
import { getCompleteOrder } from '../order/internal-orders.mock';
import { getCheckout } from './checkouts.mock';
import { getCountries } from '../geography/countries.mock';
import { getCustomerResponseBody } from '../customer/internal-customers.mock';
import CheckoutClient from './checkout-client';

describe('CheckoutClient', () => {
    let client;
    let billingAddressRequestSender;
    let countryRequestSender;
    let customerRequestSender;
    let orderRequestSender;
    let shippingCountryRequestSender;

    beforeEach(() => {
        billingAddressRequestSender = {
            updateAddress: jest.fn(() => Promise.resolve(getResponse(getCheckout()))),
            createAddress: jest.fn(() => Promise.resolve(getResponse(getCheckout()))),
        };

        countryRequestSender = {
            loadCountries: jest.fn(() => Promise.resolve(getResponse(getCountries()))),
        };

        customerRequestSender = {
            signInCustomer: jest.fn(() => Promise.resolve(getCustomerResponseBody())),
            signOutCustomer: jest.fn(() => Promise.resolve(getCustomerResponseBody())),
        };

        orderRequestSender = {
            loadOrder: jest.fn(() => Promise.resolve(getResponse(getCompleteOrder()))),
            finalizeOrder: jest.fn(() => Promise.resolve(getResponse(getCompleteOrder()))),
            submitOrder: jest.fn(() => Promise.resolve(getResponse(getCompleteOrder()))),
        };

        orderRequestSender = {
            loadOrder: jest.fn(() => Promise.resolve(getResponse(getCompleteOrder()))),
            finalizeOrder: jest.fn(() => Promise.resolve(getResponse(getCompleteOrder()))),
            submitOrder: jest.fn(() => Promise.resolve(getResponse(getCompleteOrder()))),
        };

        shippingCountryRequestSender = {
            loadCountries: jest.fn(() => Promise.resolve(getResponse(getCountries()))),
        };

        client = new CheckoutClient(
            billingAddressRequestSender,
            countryRequestSender,
            customerRequestSender,
            orderRequestSender,
            shippingCountryRequestSender
        );
    });

    describe('#loadOrder()', () => {
        it('loads order', async () => {
            const output = await client.loadOrder(295);

            expect(output).toEqual(getResponse(getCompleteOrder()));
            expect(orderRequestSender.loadOrder).toHaveBeenCalledWith(295, undefined);
        });

        it('loads order with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await client.loadOrder(295, options);

            expect(output).toEqual(getResponse(getCompleteOrder()));
            expect(orderRequestSender.loadOrder).toHaveBeenCalledWith(295, options);
        });
    });

    describe('#submitOrder()', () => {
        it('submits order', async () => {
            const payload = { useStoreCredit: false };
            const output = await client.submitOrder(payload);

            expect(output).toEqual(getResponse(getCompleteOrder()));
            expect(orderRequestSender.submitOrder).toHaveBeenCalledWith(payload, undefined);
        });

        it('submits order with timeout', async () => {
            const payload = { useStoreCredit: false };
            const options = { timeout: createTimeout() };
            const output = await client.submitOrder(payload, options);

            expect(output).toEqual(getResponse(getCompleteOrder()));
            expect(orderRequestSender.submitOrder).toHaveBeenCalledWith(payload, options);
        });
    });

    describe('#finalizeOrder()', () => {
        it('finalizes order', async () => {
            const output = await client.finalizeOrder(295);

            expect(output).toEqual(getResponse(getCompleteOrder()));
            expect(orderRequestSender.finalizeOrder).toHaveBeenCalledWith(295, undefined);
        });

        it('finalizes order with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await client.finalizeOrder(295, options);

            expect(output).toEqual(getResponse(getCompleteOrder()));
            expect(orderRequestSender.finalizeOrder).toHaveBeenCalledWith(295, options);
        });
    });

    describe('#loadCountries()', () => {
        it('loads billing countries', async () => {
            const output = await client.loadCountries();

            expect(output).toEqual(getResponse(getCountries()));
            expect(countryRequestSender.loadCountries).toHaveBeenCalled();
        });

        it('loads billing countries with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await client.loadCountries(options);

            expect(output).toEqual(getResponse(getCountries()));
            expect(countryRequestSender.loadCountries).toHaveBeenCalledWith(options);
        });
    });

    describe('#loadShippingCountries()', () => {
        it('loads shipping countries', async () => {
            const output = await client.loadShippingCountries();

            expect(output).toEqual(getResponse(getCountries()));
            expect(shippingCountryRequestSender.loadCountries).toHaveBeenCalled();
        });

        it('loads shipping countries with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await client.loadShippingCountries(options);

            expect(output).toEqual(getResponse(getCountries()));
            expect(shippingCountryRequestSender.loadCountries).toHaveBeenCalledWith(options);
        });
    });

    describe('#updateBillingAddress()', () => {
        let address;
        let options;

        beforeEach(() => {
            address = getBillingAddress();
            options = {
                timeout: createTimeout(),
            };
        });

        it('updates the billing address', async () => {
            await client.updateBillingAddress('foo', address, options);

            expect(billingAddressRequestSender.updateAddress)
                .toHaveBeenCalledWith('foo', address, options);
        });

        it('returns the billing address', async () => {
            const output = await client.updateBillingAddress('foo', address, options);

            expect(output).toEqual(getResponse(getCheckout()));
        });
    });

    describe('#createBillingAddress()', () => {
        let address;
        let options;

        beforeEach(() => {
            address = getBillingAddress();
            options = {
                timeout: createTimeout(),
            };
        });

        it('creates the billing address', async () => {
            await client.createBillingAddress('foo', address, options);

            expect(billingAddressRequestSender.createAddress)
                .toHaveBeenCalledWith('foo', address, options);
        });

        it('creates the billing address', async () => {
            const output = await client.createBillingAddress('foo', address, options);

            expect(output).toEqual(getResponse(getCheckout()));
        });
    });

    describe('#signInCustomer()', () => {
        it('signs in customer', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };
            const output = await client.signInCustomer(credentials);

            expect(output).toEqual(getCustomerResponseBody());
            expect(customerRequestSender.signInCustomer).toHaveBeenCalledWith(credentials, undefined);
        });

        it('signs in customer with timeout', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };
            const options = { timeout: createTimeout() };
            const output = await client.signInCustomer(credentials, options);

            expect(output).toEqual(getCustomerResponseBody());
            expect(customerRequestSender.signInCustomer).toHaveBeenCalledWith(credentials, options);
        });
    });

    describe('#signOutCustomer()', () => {
        it('signs out customer', async () => {
            const output = await client.signOutCustomer();

            expect(output).toEqual(getCustomerResponseBody());
            expect(customerRequestSender.signOutCustomer).toHaveBeenCalled();
        });

        it('signs out customer with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await client.signOutCustomer(options);

            expect(output).toEqual(getCustomerResponseBody());
            expect(customerRequestSender.signOutCustomer).toHaveBeenCalledWith(options);
        });
    });
});
