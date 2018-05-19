import axios from 'axios';
import { $ } from './bling';

function ajaxHeart(e) {
 e.preventDefault();
 axios
     .post(this.action)
     .then(res => {
        console.log(res.data);
        //This is form tag
       // sub elements with name, access as property
       // i.e this is a button
        const isHearted = this.heart.classList.toggle('heart__button--hearted');
      $('.heart-count').textContent = res.data.hearts.length;
      if (isHearted){
        this.heart.classList.add('heart__button--float');
        setTimeout(() => this.heart.classList.remove('heart__button--float'), 2500);
      }

     })
     .catch(console.error);
}


export default ajaxHeart;