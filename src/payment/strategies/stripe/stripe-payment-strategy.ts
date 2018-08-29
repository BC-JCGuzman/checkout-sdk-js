import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentRequestOptions } from '../../payment-request-options';

import CreditCardPaymentStrategy from '../credit-card-payment-strategy';

export default class StripePaymentStrategy extends CreditCardPaymentStrategy {
    constructor(
        store: CheckoutStore,
        _orderActionCreator: OrderActionCreator,
        _paymentActionCreator: PaymentActionCreator
    ) {
        super(store, _orderActionCreator, _paymentActionCreator);
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return super.execute(payload, options);
    }
}
