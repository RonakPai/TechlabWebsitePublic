declare const paypal: any;
declare const ga: any;
declare const Stripe: any;
declare const firebase: any;

declare namespace Techlab {
  interface ClassPlan {
    name: string,
    price: number,
    weeks: string[],
    times: string[]
  }
}

declare module '*.json' {
  export const plans: { [index: string]: Techlab.ClassPlan }
}


interface String {
  capitalize: () => string;
}

interface HTMLElement {
  checked: boolean;
}

interface JQuery<TElement = HTMLElement> {
  modal: (status: string) => JQuery<TElement>;
  validate: any;
}
