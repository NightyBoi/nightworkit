import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import emailjs, { type EmailJSResponseStatus } from '@emailjs/browser';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('animTarget') animTargets!: QueryList<ElementRef<HTMLElement>>;

  contactDetails = {
    first_name: '',
    last_name: '',
    email: '',
    projectLength: '',
    message: ''
  };

  submitted = false;
  validSubmit = false;
  success = false;
  error = false;

  bookingOpen = false;
  bookingVisible = false;
  private bookingTimer: ReturnType<typeof setTimeout> | null = null;

  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting).sort(
          (a, b) => (a.target as HTMLElement).dataset['order']! > (b.target as HTMLElement).dataset['order']! ? 1 : -1
        );
        visible.forEach((entry, i) => {
          setTimeout(() => {
            (entry.target as HTMLElement).classList.add('in');
            this.observer?.unobserve(entry.target);
          }, i * 90);
        });
      },
      { threshold: 0.2 }
    );
    this.animTargets.forEach(ref => this.observer!.observe(ref.nativeElement));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  openBooking(e: Event): void {
    e.preventDefault();
    if (this.bookingTimer) clearTimeout(this.bookingTimer);
    this.bookingOpen = true;
    document.body.style.overflow = 'hidden';
    setTimeout(() => { this.bookingVisible = true; });
  }

  closeBooking(): void {
    this.bookingVisible = false;
    this.bookingTimer = setTimeout(() => {
      this.bookingOpen = false;
      document.body.style.overflow = '';
    }, 320);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.bookingVisible) this.closeBooking(); }

  formSubmit(form: NgForm, e: Event): void {
    this.submitted = true;

    if (form.valid) {
      this.success = false;
      this.error = false;
      this.validSubmit = true;

      emailjs
        .sendForm('service_aiq89ai', 'template_cjgikla', e.target as HTMLFormElement, {
          publicKey: 'XARZv932EpS35tOVv'
        })
        .then(
          () => {
            this.validSubmit = false;
            this.success = true;
            form.reset();
            this.contactDetails.projectLength = '';
          },
          (err) => {
            this.validSubmit = false;
            this.error = true;
            console.error('EmailJS error:', (err as EmailJSResponseStatus).text);
          }
        );
    }
  }
}
