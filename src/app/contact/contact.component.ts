import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import emailjs, { type EmailJSResponseStatus } from '@emailjs/browser';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  contactDetails = {
    first_name: '',
    last_name: '',
    email: '',
    projectLength: '',
    message: ''
  }

  formSubmit(form: NgForm, e: Event){
    if(form.valid){
      console.log(e.target);

      
      // emailjs
      // .sendForm('service_aiq89ai', 'template_cjgikla', e.target as HTMLFormElement, {
      //   publicKey: 'XARZv932EpS35tOVv',
      // })
      // .then(
      //   () => {
      //     console.log('SUCCESS!');
      //   },
      //   (error) => {
      //     console.log('FAILED...', (error as EmailJSResponseStatus).text);
      //   },
      // );
    }
  }


}
