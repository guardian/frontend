// @flow
import type { CtaUrls } from 'common/modules/commercial/contributions-utilities';

export const epicButtonsTemplate = ({
    membershipUrl = '',
    contributeUrl = '',
}: CtaUrls) =>
    `<div class="contributions__amount-field">
          <div>
            <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member contributions__contribute--epic-member-top"
              href="${membershipUrl}"
              target="_blank">
              Become a supporter
            </a>
          </div>
        
          <div>
            <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member"
             href="${contributeUrl}"
             target="_blank">
             Make a contribution
           </a>
          </div>
    </div>`;
