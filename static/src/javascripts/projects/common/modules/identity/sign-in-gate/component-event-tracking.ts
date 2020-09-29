
import ophan from "ophan/ng";

type ABTestVariant = {
  name: string;
  variant: string;
};

type ComponentEventWithoutAction = {
  component: OphanComponent;
  value?: string;
  id?: string;
  abTest?: ABTestVariant;
};

// ophan helper methods
export const submitComponentEventTracking = (componentEvent: OphanComponentEvent) => {
  ophan.record({ componentEvent });
};

export const submitViewEventTracking = (componentEvent: ComponentEventWithoutAction) => submitComponentEventTracking({
  ...componentEvent,
  action: 'VIEW'
});

export const submitClickEventTracking = (componentEvent: ComponentEventWithoutAction) => submitComponentEventTracking({
  ...componentEvent,
  action: 'CLICK'
});