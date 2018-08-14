import { getCheckoutStoreState } from './checkouts.mock';
import createInternalCheckoutSelectors from './create-internal-checkout-selectors';
import CheckoutStoreStatusSelector from './checkout-store-status-selector';

describe('CheckoutStoreStatusSelector', () => {
    let selectors;
    let statuses;

    beforeEach(() => {
        selectors = createInternalCheckoutSelectors(getCheckoutStoreState());
        statuses = new CheckoutStoreStatusSelector(selectors);
    });

    describe('#isLoadingCheckout()', () => {
        it('returns true if loading checkout', () => {
            jest.spyOn(selectors.checkout, 'isLoading').mockReturnValue(true);

            expect(statuses.isLoadingCheckout()).toEqual(true);
            expect(selectors.checkout.isLoading).toHaveBeenCalled();
        });

        it('returns false if loading checkout', () => {
            jest.spyOn(selectors.checkout, 'isLoading').mockReturnValue(false);

            expect(statuses.isLoadingCheckout()).toEqual(false);
            expect(selectors.checkout.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isUpdatingCheckout()', () => {
        it('returns true if loading checkout', () => {
            jest.spyOn(selectors.checkout, 'isUpdating').mockReturnValue(true);

            expect(statuses.isUpdatingCheckout()).toEqual(true);
            expect(selectors.checkout.isUpdating).toHaveBeenCalled();
        });

        it('returns false if loading checkout', () => {
            jest.spyOn(selectors.checkout, 'isUpdating').mockReturnValue(false);

            expect(statuses.isUpdatingCheckout()).toEqual(false);
            expect(selectors.checkout.isUpdating).toHaveBeenCalled();
        });
    });

    describe('#isSubmittingOrder()', () => {
        it('returns true if submitting order', () => {
            jest.spyOn(selectors.paymentStrategies, 'isExecuting').mockReturnValue(true);

            expect(statuses.isSubmittingOrder()).toEqual(true);
            expect(selectors.paymentStrategies.isExecuting).toHaveBeenCalled();
        });

        it('returns false if submitting order', () => {
            jest.spyOn(selectors.paymentStrategies, 'isExecuting').mockReturnValue(false);

            expect(statuses.isSubmittingOrder()).toEqual(false);
            expect(selectors.paymentStrategies.isExecuting).toHaveBeenCalled();
        });
    });

    describe('#isFinalizingOrder()', () => {
        it('returns true if finalizing order', () => {
            jest.spyOn(selectors.paymentStrategies, 'isFinalizing').mockReturnValue(true);

            expect(statuses.isFinalizingOrder()).toEqual(true);
            expect(selectors.paymentStrategies.isFinalizing).toHaveBeenCalled();
        });

        it('returns false if finalizing order', () => {
            jest.spyOn(selectors.paymentStrategies, 'isFinalizing').mockReturnValue(false);

            expect(statuses.isFinalizingOrder()).toEqual(false);
            expect(selectors.paymentStrategies.isFinalizing).toHaveBeenCalled();
        });
    });

    describe('#isLoadingOrder()', () => {
        it('returns true if loading order', () => {
            jest.spyOn(selectors.order, 'isLoading').mockReturnValue(true);

            expect(statuses.isLoadingOrder()).toEqual(true);
            expect(selectors.order.isLoading).toHaveBeenCalled();
        });

        it('returns false if loading order', () => {
            jest.spyOn(selectors.order, 'isLoading').mockReturnValue(false);

            expect(statuses.isLoadingOrder()).toEqual(false);
            expect(selectors.order.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isLoadingCart()', () => {
        it('returns true if loading cart', () => {
            jest.spyOn(selectors.cart, 'isLoading').mockReturnValue(true);

            expect(statuses.isLoadingCart()).toEqual(true);
            expect(selectors.cart.isLoading).toHaveBeenCalled();
        });

        it('returns false if loading cart', () => {
            jest.spyOn(selectors.cart, 'isLoading').mockReturnValue(false);

            expect(statuses.isLoadingCart()).toEqual(false);
            expect(selectors.cart.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isLoadingBillingCountries()', () => {
        it('returns true if loading countries', () => {
            jest.spyOn(selectors.countries, 'isLoading').mockReturnValue(true);

            expect(statuses.isLoadingBillingCountries()).toEqual(true);
            expect(selectors.countries.isLoading).toHaveBeenCalled();
        });

        it('returns false if loading countries', () => {
            jest.spyOn(selectors.countries, 'isLoading').mockReturnValue(false);

            expect(statuses.isLoadingBillingCountries()).toEqual(false);
            expect(selectors.countries.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isLoadingShippingCountries()', () => {
        it('returns true if loading shipping countries', () => {
            jest.spyOn(selectors.shippingCountries, 'isLoading').mockReturnValue(true);

            expect(statuses.isLoadingShippingCountries()).toEqual(true);
            expect(selectors.shippingCountries.isLoading).toHaveBeenCalled();
        });

        it('returns false if loading shipping countries', () => {
            jest.spyOn(selectors.shippingCountries, 'isLoading').mockReturnValue(false);

            expect(statuses.isLoadingShippingCountries()).toEqual(false);
            expect(selectors.shippingCountries.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isLoadingPaymentMethods()', () => {
        it('returns true if loading payment methods', () => {
            jest.spyOn(selectors.paymentMethods, 'isLoading').mockReturnValue(true);

            expect(statuses.isLoadingPaymentMethods()).toEqual(true);
            expect(selectors.paymentMethods.isLoading).toHaveBeenCalled();
        });

        it('returns false if loading payment methods', () => {
            jest.spyOn(selectors.paymentMethods, 'isLoading').mockReturnValue(false);

            expect(statuses.isLoadingPaymentMethods()).toEqual(false);
            expect(selectors.paymentMethods.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isLoadingPaymentMethod()', () => {
        it('returns true if loading payment method', () => {
            jest.spyOn(selectors.paymentMethods, 'isLoadingMethod').mockReturnValue(true);

            expect(statuses.isLoadingPaymentMethod('braintree')).toEqual(true);
            expect(selectors.paymentMethods.isLoadingMethod).toHaveBeenCalledWith('braintree');
        });

        it('returns false if loading payment methods', () => {
            jest.spyOn(selectors.paymentMethods, 'isLoadingMethod').mockReturnValue(false);

            expect(statuses.isLoadingPaymentMethod('braintree')).toEqual(false);
            expect(selectors.paymentMethods.isLoadingMethod).toHaveBeenCalledWith('braintree');
        });
    });

    describe('#isInitializingPayment()', () => {
        beforeEach(() => {
            jest.spyOn(selectors.paymentStrategies, 'isInitializing').mockReturnValue(false);
        });

        it('returns true if initializing payment', () => {
            jest.spyOn(selectors.paymentStrategies, 'isInitializing').mockReturnValue(true);

            expect(statuses.isInitializingPayment('foobar')).toEqual(true);
            expect(selectors.paymentStrategies.isInitializing).toHaveBeenCalledWith('foobar');
        });

        it('returns false if not initializing payment', () => {
            expect(statuses.isInitializingPayment('foobar')).toEqual(false);
            expect(selectors.paymentStrategies.isInitializing).toHaveBeenCalledWith('foobar');
        });
    });

    describe('#isSigningIn()', () => {
        it('returns true if signing in', () => {
            jest.spyOn(selectors.customerStrategies, 'isSigningIn').mockReturnValue(true);

            expect(statuses.isSigningIn()).toEqual(true);
            expect(selectors.customerStrategies.isSigningIn).toHaveBeenCalled();
        });

        it('returns false if signing in', () => {
            jest.spyOn(selectors.customerStrategies, 'isSigningIn').mockReturnValue(false);

            expect(statuses.isSigningIn()).toEqual(false);
            expect(selectors.customerStrategies.isSigningIn).toHaveBeenCalled();
        });
    });

    describe('#isSigningOut()', () => {
        beforeEach(() => {
            jest.spyOn(selectors.customerStrategies, 'isSigningOut').mockReturnValue(false);
        });

        it('returns true if signing out', () => {
            jest.spyOn(selectors.customerStrategies, 'isSigningOut').mockReturnValue(true);

            expect(statuses.isSigningOut()).toEqual(true);
            expect(selectors.customerStrategies.isSigningOut).toHaveBeenCalled();
        });

        it('returns false if signing out', () => {
            expect(statuses.isSigningOut()).toEqual(false);
            expect(selectors.customerStrategies.isSigningOut).toHaveBeenCalled();
        });
    });

    describe('#isInitializingCustomer()', () => {
        it('returns true if initializing', () => {
            jest.spyOn(selectors.customerStrategies, 'isInitializing').mockReturnValue(true);

            expect(statuses.isInitializingCustomer('foobar')).toEqual(true);
            expect(selectors.customerStrategies.isInitializing).toHaveBeenCalledWith('foobar');
        });

        it('returns false if not initializing', () => {
            jest.spyOn(selectors.customerStrategies, 'isInitializing').mockReturnValue(false);

            expect(statuses.isInitializingCustomer('foobar')).toEqual(false);
            expect(selectors.customerStrategies.isInitializing).toHaveBeenCalledWith('foobar');
        });
    });

    describe('#isLoadingShippingOptions()', () => {
        it('returns true if loading shipping options', () => {
            jest.spyOn(selectors.consignments, 'isLoadingShippingOptions').mockReturnValue(true);

            expect(statuses.isLoadingShippingOptions()).toEqual(true);
            expect(selectors.consignments.isLoadingShippingOptions).toHaveBeenCalled();
        });

        it('returns false if not loading shipping options', () => {
            jest.spyOn(selectors.consignments, 'isLoadingShippingOptions').mockReturnValue(false);

            expect(statuses.isLoadingShippingOptions()).toEqual(false);
            expect(selectors.consignments.isLoadingShippingOptions).toHaveBeenCalled();
        });
    });

    describe('#isSelectingShippingOption()', () => {
        it('returns true if selecting shipping options', () => {
            jest.spyOn(selectors.shippingStrategies, 'isSelectingOption').mockReturnValue(true);

            expect(statuses.isSelectingShippingOption()).toEqual(true);
            expect(selectors.shippingStrategies.isSelectingOption).toHaveBeenCalled();
        });

        it('returns false if not selecting shipping options', () => {
            jest.spyOn(selectors.shippingStrategies, 'isSelectingOption').mockReturnValue(false);

            expect(statuses.isSelectingShippingOption()).toEqual(false);
            expect(selectors.shippingStrategies.isSelectingOption).toHaveBeenCalled();
        });
    });

    describe('#isUpdatingBillingAddress()', () => {
        it('returns true if updating billing address', () => {
            jest.spyOn(selectors.billingAddress, 'isUpdating').mockReturnValue(true);

            expect(statuses.isUpdatingBillingAddress()).toEqual(true);
            expect(selectors.billingAddress.isUpdating).toHaveBeenCalled();
        });

        it('returns false if not updating billing address', () => {
            jest.spyOn(selectors.billingAddress, 'isUpdating').mockReturnValue(false);

            expect(statuses.isUpdatingBillingAddress()).toEqual(false);
            expect(selectors.billingAddress.isUpdating).toHaveBeenCalled();
        });
    });

    describe('#isUpdatingShippingAddress()', () => {
        it('returns true if updating shipping address', () => {
            jest.spyOn(selectors.shippingStrategies, 'isUpdatingAddress').mockReturnValue(true);

            expect(statuses.isUpdatingShippingAddress()).toEqual(true);
            expect(selectors.shippingStrategies.isUpdatingAddress).toHaveBeenCalled();
        });

        it('returns false if not updating shipping address', () => {
            jest.spyOn(selectors.shippingStrategies, 'isUpdatingAddress').mockReturnValue(false);

            expect(statuses.isUpdatingShippingAddress()).toEqual(false);
            expect(selectors.shippingStrategies.isUpdatingAddress).toHaveBeenCalled();
        });
    });

    describe('#isUpdatingConsignment()', () => {
        it('returns true if updating shipping address', () => {
            jest.spyOn(selectors.consignments, 'isUpdating').mockReturnValue(true);

            expect(statuses.isUpdatingConsignment()).toEqual(true);
            expect(selectors.consignments.isUpdating).toHaveBeenCalled();
        });

        it('returns false if not updating shipping address', () => {
            jest.spyOn(selectors.consignments, 'isUpdating').mockReturnValue(false);

            expect(statuses.isUpdatingConsignment()).toEqual(false);
            expect(selectors.consignments.isUpdating).toHaveBeenCalled();
        });
    });

    describe('#isDeletingConsignment()', () => {
        it('returns true if deleting consignment', () => {
            jest.spyOn(selectors.consignments, 'isDeleting').mockReturnValue(true);

            expect(statuses.isDeletingConsignment()).toEqual(true);
            expect(selectors.consignments.isDeleting).toHaveBeenCalled();
        });

        it('returns false if not deleting consignment', () => {
            jest.spyOn(selectors.consignments, 'isDeleting').mockReturnValue(false);

            expect(statuses.isDeletingConsignment()).toEqual(false);
            expect(selectors.consignments.isDeleting).toHaveBeenCalled();
        });
    });

    describe('#isCreatingConsignments()', () => {
        it('returns true if updating shipping address', () => {
            jest.spyOn(selectors.consignments, 'isCreating').mockReturnValue(true);

            expect(statuses.isCreatingConsignments()).toEqual(true);
            expect(selectors.consignments.isCreating).toHaveBeenCalled();
        });

        it('returns false if not updating shipping address', () => {
            jest.spyOn(selectors.consignments, 'isCreating').mockReturnValue(false);

            expect(statuses.isCreatingConsignments()).toEqual(false);
            expect(selectors.consignments.isCreating).toHaveBeenCalled();
        });
    });

    describe('#isInitializingShipping()', () => {
        it('returns true if initializing shipping', () => {
            jest.spyOn(selectors.shippingStrategies, 'isInitializing').mockReturnValue(true);

            expect(statuses.isInitializingShipping('foobar')).toEqual(true);
            expect(selectors.shippingStrategies.isInitializing).toHaveBeenCalledWith('foobar');
        });

        it('returns false if not initializing shipping', () => {
            jest.spyOn(selectors.shippingStrategies, 'isInitializing').mockReturnValue(false);

            expect(statuses.isInitializingShipping('foobar')).toEqual(false);
            expect(selectors.shippingStrategies.isInitializing).toHaveBeenCalledWith('foobar');
        });
    });

    describe('#isApplyingCoupon()', () => {
        it('returns true if applying a coupon', () => {
            jest.spyOn(selectors.coupons, 'isApplying').mockReturnValue(true);

            expect(statuses.isApplyingCoupon()).toEqual(true);
            expect(selectors.coupons.isApplying).toHaveBeenCalled();
        });

        it('returns false if not applying a coupon', () => {
            jest.spyOn(selectors.coupons, 'isApplying').mockReturnValue(false);

            expect(statuses.isApplyingCoupon()).toEqual(false);
            expect(selectors.coupons.isApplying).toHaveBeenCalled();
        });
    });

    describe('#isRemovingCoupon()', () => {
        it('returns true if removing a coupon', () => {
            jest.spyOn(selectors.coupons, 'isRemoving').mockReturnValue(true);

            expect(statuses.isRemovingCoupon()).toEqual(true);
            expect(selectors.coupons.isRemoving).toHaveBeenCalled();
        });

        it('returns false if not removing a coupon', () => {
            jest.spyOn(selectors.coupons, 'isRemoving').mockReturnValue(false);

            expect(statuses.isRemovingCoupon()).toEqual(false);
            expect(selectors.coupons.isRemoving).toHaveBeenCalled();
        });
    });

    describe('#isApplyingGiftCertificate()', () => {
        it('returns true if applying a gift certificate', () => {
            jest.spyOn(selectors.giftCertificates, 'isApplying').mockReturnValue(true);

            expect(statuses.isApplyingGiftCertificate()).toEqual(true);
            expect(selectors.giftCertificates.isApplying).toHaveBeenCalled();
        });

        it('returns false if not applying a gift certificate', () => {
            jest.spyOn(selectors.giftCertificates, 'isApplying').mockReturnValue(false);

            expect(statuses.isApplyingGiftCertificate()).toEqual(false);
            expect(selectors.giftCertificates.isApplying).toHaveBeenCalled();
        });
    });

    describe('#isRemovingGiftCertificate()', () => {
        it('returns true if removing a gift certificate', () => {
            jest.spyOn(selectors.giftCertificates, 'isRemoving').mockReturnValue(true);

            expect(statuses.isRemovingGiftCertificate()).toEqual(true);
            expect(selectors.giftCertificates.isRemoving).toHaveBeenCalled();
        });

        it('returns false if not removing a gift certificate', () => {
            jest.spyOn(selectors.giftCertificates, 'isRemoving').mockReturnValue(false);

            expect(statuses.isRemovingGiftCertificate()).toEqual(false);
            expect(selectors.giftCertificates.isRemoving).toHaveBeenCalled();
        });
    });

    describe('#isLoadingInstruments()', () => {
        it('returns true if loading instruments', () => {
            jest.spyOn(selectors.instruments, 'isLoading').mockReturnValue(true);

            expect(statuses.isLoadingInstruments()).toEqual(true);
            expect(selectors.instruments.isLoading).toHaveBeenCalled();
        });

        it('returns false if not loading instruments', () => {
            jest.spyOn(selectors.instruments, 'isLoading').mockReturnValue(false);

            expect(statuses.isLoadingInstruments()).toEqual(false);
            expect(selectors.instruments.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isDeletingInstrument()', () => {
        it('returns true if deleting instrument', () => {
            jest.spyOn(selectors.instruments, 'isDeleting').mockReturnValue(true);

            expect(statuses.isDeletingInstrument('123')).toEqual(true);
            expect(selectors.instruments.isDeleting).toHaveBeenCalledWith('123');
        });

        it('returns false if not deleting instrument', () => {
            jest.spyOn(selectors.instruments, 'isDeleting').mockReturnValue(false);

            expect(statuses.isDeletingInstrument('123')).toEqual(false);
            expect(selectors.instruments.isDeleting).toHaveBeenCalledWith('123');
        });
    });

    describe('#isLoadingConfig()', () => {
        it('returns true if loading config', () => {
            jest.spyOn(selectors.config, 'isLoading').mockReturnValue(true);

            expect(statuses.isLoadingConfig()).toEqual(true);
            expect(selectors.config.isLoading).toHaveBeenCalledWith();
        });

        it('returns false if not loading config', () => {
            jest.spyOn(selectors.config, 'isLoading').mockReturnValue(false);

            expect(statuses.isLoadingConfig()).toEqual(false);
            expect(selectors.config.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isPaymentStepPending()', () => {
        it('returns true if widget is interacting', () => {
            jest.spyOn(selectors.paymentStrategies, 'isWidgetInteracting').mockReturnValue(true);

            expect(statuses.isPaymentStepPending()).toEqual(true);
            expect(selectors.paymentStrategies.isWidgetInteracting).toHaveBeenCalled();
        });

        it('returns false if widget is not interacting', () => {
            jest.spyOn(selectors.paymentStrategies, 'isWidgetInteracting').mockReturnValue(false);

            expect(statuses.isPaymentStepPending()).toEqual(false);
            expect(selectors.paymentStrategies.isWidgetInteracting).toHaveBeenCalled();
        });

        it('returns true if strategy is initializing', () => {
            jest.spyOn(selectors.paymentStrategies, 'isInitializing').mockReturnValue(true);

            expect(statuses.isPaymentStepPending()).toEqual(true);
            expect(selectors.paymentStrategies.isInitializing).toHaveBeenCalled();
        });

        it('returns false if strategy is not initializing', () => {
            jest.spyOn(selectors.paymentStrategies, 'isInitializing').mockReturnValue(false);

            expect(statuses.isPaymentStepPending()).toEqual(false);
            expect(selectors.paymentStrategies.isInitializing).toHaveBeenCalled();
        });

        it('returns true if strategy is executing', () => {
            jest.spyOn(selectors.paymentStrategies, 'isExecuting').mockReturnValue(true);

            expect(statuses.isPaymentStepPending()).toEqual(true);
            expect(selectors.paymentStrategies.isExecuting).toHaveBeenCalled();
        });

        it('returns false if strategy is not executing', () => {
            jest.spyOn(selectors.paymentStrategies, 'isExecuting').mockReturnValue(false);

            expect(statuses.isPaymentStepPending()).toEqual(false);
            expect(selectors.paymentStrategies.isExecuting).toHaveBeenCalled();
        });

        it('returns true if strategy is finalizing', () => {
            jest.spyOn(selectors.paymentStrategies, 'isFinalizing').mockReturnValue(true);

            expect(statuses.isPaymentStepPending()).toEqual(true);
            expect(selectors.paymentStrategies.isFinalizing).toHaveBeenCalled();
        });

        it('returns false if strategy is not finalizing', () => {
            jest.spyOn(selectors.paymentStrategies, 'isFinalizing').mockReturnValue(false);

            expect(statuses.isPaymentStepPending()).toEqual(false);
            expect(selectors.paymentStrategies.isFinalizing).toHaveBeenCalled();
        });
    });

    describe('#isCustomerStepPending()', () => {
        it('returns true if widget is interacting', () => {
            jest.spyOn(selectors.customerStrategies, 'isWidgetInteracting').mockReturnValue(true);

            expect(statuses.isCustomerStepPending()).toEqual(true);
            expect(selectors.customerStrategies.isWidgetInteracting).toHaveBeenCalled();
        });

        it('returns false if widget is not interacting', () => {
            jest.spyOn(selectors.customerStrategies, 'isWidgetInteracting').mockReturnValue(false);

            expect(statuses.isCustomerStepPending()).toEqual(false);
            expect(selectors.customerStrategies.isWidgetInteracting).toHaveBeenCalled();
        });

        it('returns true if strategy is initializing', () => {
            jest.spyOn(selectors.customerStrategies, 'isInitializing').mockReturnValue(true);

            expect(statuses.isCustomerStepPending()).toEqual(true);
            expect(selectors.customerStrategies.isInitializing).toHaveBeenCalled();
        });

        it('returns false if strategy is not initializing', () => {
            jest.spyOn(selectors.customerStrategies, 'isInitializing').mockReturnValue(false);

            expect(statuses.isCustomerStepPending()).toEqual(false);
            expect(selectors.customerStrategies.isInitializing).toHaveBeenCalled();
        });

        it('returns true if strategy is executing', () => {
            jest.spyOn(selectors.customerStrategies, 'isSigningIn').mockReturnValue(true);

            expect(statuses.isCustomerStepPending()).toEqual(true);
            expect(selectors.customerStrategies.isSigningIn).toHaveBeenCalled();
        });

        it('returns false if strategy is not executing', () => {
            jest.spyOn(selectors.customerStrategies, 'isSigningIn').mockReturnValue(false);

            expect(statuses.isCustomerStepPending()).toEqual(false);
            expect(selectors.customerStrategies.isSigningIn).toHaveBeenCalled();
        });

        it('returns true if strategy is finalizing', () => {
            jest.spyOn(selectors.customerStrategies, 'isSigningOut').mockReturnValue(true);

            expect(statuses.isCustomerStepPending()).toEqual(true);
            expect(selectors.customerStrategies.isSigningOut).toHaveBeenCalled();
        });

        it('returns false if strategy is not finalizing', () => {
            jest.spyOn(selectors.customerStrategies, 'isSigningOut').mockReturnValue(false);

            expect(statuses.isCustomerStepPending()).toEqual(false);
            expect(selectors.customerStrategies.isSigningOut).toHaveBeenCalled();
        });
    });
});
