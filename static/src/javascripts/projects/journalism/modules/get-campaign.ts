
import config from "lib/config";

export const getCampaigns = () => {
  // eslint-disable-next-line
  const isCallout = campaign => campaign.fields._type === 'callout';
  const allCampaigns = config.get('page.campaigns');
  const allCallouts = allCampaigns.filter(isCallout);

  return allCallouts.reduce((acc, curr) => {
    acc[curr.fields.tagName] = {
      name: curr.name,
      title: curr.fields.callout,
      description: curr.fields.description || '',
      formFields: curr.fields.formFields,
      formId: curr.fields.formId,
      tagName: curr.fields.tagName
    };
    return acc;
  }, {});
};