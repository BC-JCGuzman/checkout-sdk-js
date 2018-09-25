export interface MasterpassPaymentInitializeOptions {
    /**
     * A callback that gets called when an error occurs.
     */
    onError?(error: Error): void;

    /**
     * A callback that gets called when the customer selects a payment option.
     */
    onPaymentSelect?(): void;
}
