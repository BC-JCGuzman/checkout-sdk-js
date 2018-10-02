export interface MasterpassPaymentInitializeOptions {
    /**
     * The gateway where the masterpass payment will be processed.
     */
    gateway?: string;

    /**
     * A callback that gets called when an error occurs.
     */
    onError?(error: Error): void;

    /**
     * A callback that gets called when the customer selects a payment option.
     */
    onPaymentSelect?(): void;
}
