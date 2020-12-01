

import avatarApi from "common/modules/avatar/api";
import bonzo from "bonzo";
import config from "lib/config";
import fastdom from "lib/fastdom-promise";

const avatarify = (container: HTMLElement): void => {
  const updating = bonzo(bonzo.create('<div class="is-updating"></div>'));
  const avatar = bonzo(bonzo.create('<img class="user-avatar__image" alt="" />'));
  const avatarUserId = container.dataset.userid;
  const userId = config.get('user.id', null);

  const updateCleanup = (upd: bonzo, avat: bonzo) => {
    upd.remove();
    avat.appendTo(container);
  };

  container.classList.remove('is-hidden');
  updating.css('display', 'block').appendTo(container);

  if (avatarUserId === userId) {
    avatarApi.getActive().then(response => {
      avatar.attr('src', response.data.avatarUrl);
    }).catch(() => {
      const url = avatarApi.deterministicUrl(avatarUserId);
      avatar.attr('src', url);
    }).always(() => {
      updateCleanup(updating, avatar);
    });
  } else {
    avatar.attr('src', avatarApi.deterministicUrl(avatarUserId));
    updateCleanup(updating, avatar);
  }
};

const initUserAvatars = (): Promise<void> => fastdom.measure(() => document.getElementsByClassName('user-avatar')).then(avatars => {
  if (avatars) {
    Array.from(avatars).forEach(avatarify);
  }
});

export { initUserAvatars, avatarify };