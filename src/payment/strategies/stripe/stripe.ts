export interface StripeHostWindow extends Window {
    masterpass?: Masterpass;
}

export interface StripePaymentInitializeOptions {
    masterpassEnabled: boolean;
    masterpassContainer: string;
}

export interface Masterpass {
    checkout(options: MasterpassCheckoutOptions): void;
}

export interface MasterpassCheckoutOptions {
    checkoutId: string;
    allowedCardTypes: string[];
    amount: string;
    currency: string;
    cartId: string;
    callbackUrl?: string;
}
