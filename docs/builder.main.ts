import { AnimationBuilder } from 'css-animator/builder';

const element = document.getElementById('animate');
const showButton = document.getElementById('showButton');
const shakeButton = document.getElementById('shakeButton');
const hideButton = document.getElementById('hideButton');

const animator = new AnimationBuilder();

animator
  .setType('fadeInUp')
  .setDelay(100)
  .show(element);

showButton.onclick = () => {
  showButton.setAttribute('disabled', '');

  animator
    .setType('fadeInUp')
    .setDuration(1000)
    .show(element)
    .then(() => {
      hideButton.removeAttribute('disabled');
      shakeButton.removeAttribute('disabled');
    })
    .catch(e => {
      console.log('css-animator: Animation aborted', e);
      hideButton.removeAttribute('disabled');
      shakeButton.removeAttribute('disabled');
    });
};

shakeButton.onclick = () => {
  shakeButton.setAttribute('disabled', '');
  hideButton.setAttribute('disabled', '');

  animator
    .setType('shake')
    .setDuration(1500)
    .animate(element)
    .then(() => {
      shakeButton.removeAttribute('disabled');
      hideButton.removeAttribute('disabled');
    })
    .catch(e => {
      console.log('css-animator: Animation aborted', e);
      shakeButton.removeAttribute('disabled');
      hideButton.removeAttribute('disabled');
    });
};

hideButton.onclick = () => {
  hideButton.setAttribute('disabled', '');
  shakeButton.setAttribute('disabled', '');

  animator
    .setType('fadeOutDown')
    .setDuration(1000)
    .hide(element)
    .then(() => {
      showButton.removeAttribute('disabled');
      shakeButton.setAttribute('disabled', '');
    })
    .catch(e => {
      console.log('css-animator: Animation aborted', e);
      showButton.removeAttribute('disabled');
      shakeButton.setAttribute('disabled', '');
    });
};
