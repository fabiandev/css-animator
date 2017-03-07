import { AnimationBuilder } from 'css-animator/builder';

const animator = new AnimationBuilder();
const element = document.getElementById('animate');
const button = document.getElementById('button');

animator
  .setType('fadeOutDown')
  .setDelay(100)
  .hide(element);

button.onclick = () => {
  button.setAttribute('disabled', '');

  animator
    .setType('fadeInUp')
    .setDelay(0)
    .show(element)
    .then(el => {
      return animator
        .setDelay(500)
        .setDuration(1500)
        .setType('shake')
        .animate(el);
    })
    .then(el => {
      return animator
        .setDelay(1000)
        .setDuration(1000)
        .setType('fadeOutDown')
        .hide(el);
    })
    .then(() => {
      animator.setDelay(0);
      button.removeAttribute('disabled');
    })
    .catch(() => {
      button.removeAttribute('disabled');
    });
};
