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

  submitted = false;
  validSubmit = false;
  success = false;
  error = false;

  formSubmit(form: NgForm, e: Event){
    this.submitted = true;

    if(form.valid){
      console.log(this.contactDetails);
      this.success = false;
      this.error = false;
      this.validSubmit = true;
      
      emailjs
      .sendForm('service_aiq89ai', 'template_cjgikla', e.target as HTMLFormElement, {
        publicKey: 'XARZv932EpS35tOVv',
      })
      .then(
        () => {
          this.validSubmit = false;
          this.success = true;
          form.reset();
          this.contactDetails.projectLength = '';
          console.log('SUCCESS!');
        },
        (error) => {
          this.error = true;
          console.log('FAILED...', (error as EmailJSResponseStatus).text);
        },
      );
    }
  }


}
