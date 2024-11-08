import { Component } from '@angular/core';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent {
  activeIndex: number = 0;
  fadeIn: boolean = false;
  fadeOut: boolean = false;

  services = [{
    service: "Web Design",
    description_1: "Every element we design—from layout to color schemes, typography to navigation—aims to provide a seamless user experience that keeps visitors on your site and encourages interaction. Our approach combines creativity with functionality, ensuring that your website isn't just beautiful but also optimized for usability, mobile-friendliness, and SEO.",
    description_2: "Whether you're launching a new brand, refreshing an existing one, or building an e-commerce platform, our team collaborates with you every step of the way to deliver a pixel perfect design that aligns with your vision and business goals.",
    image_path: "./web-design.jpg"
  }, {
    service: "Web Development",
    description_1: "With a focus on both the front end, back end and a professionally designed database, we ensure that your site not only looks good but works seamlessly, providing a smooth experience for your users.",
    description_2: "Our development process is thorough and collaborative, involving you in each step to tailor features that align with your unique business needs. From e-commerce and content management systems to interactive web applications, we leverage the latest technologies and best practices to make your site adaptable, responsive, and future-ready.",
    image_path: "./web-development.jpg"
  }, {
    service: "E-commerce Solutions",
    description_1: "From intuitive product catalogs and secure payment processing to inventory management and user-friendly checkouts, every element is optimized to enhance conversion rates and customer satisfaction. We work closely with you to understand your unique requirements and brand identity, ensuring the final product not only meets but exceeds your expectations.",
    description_2: "Our team integrates the latest e-commerce technologies and best practices, including mobile responsiveness, SEO optimization, and analytics, so your store is always ahead of the curve.",
    image_path: "./e-commerce.jpg"
  }, {
    service: "Website Maintenance and Support",
    description_1: "We understand that your website is a crucial part of your business, so we handle everything from regular updates and security patches to performance monitoring and troubleshooting.",
    description_2: "Our proactive approach means we're constantly scanning for potential issues and optimizing your site's performance, so it always provides the best experience for your users. Whether it's adding new features, managing backups, or handling unexpected downtime, our team is dedicated to keeping your site running smoothly and efficiently.",
    image_path: "./maintenance.jpg"
  }, {
    service: "Custom Solutions",
    description_1: "We know that not every project fits into a standard mold, which is why we offer flexible, innovative IT solutions designed specifically for your needs. Whether you require a specialized web application, custom integrations, advanced data processing, or unique functionality, we're here to make it happen.",
    description_2: "With Night Work IT's custom approach, you get more than a one-size-fits-all answer; you get a solution built around your success.",
    image_path: "./custom.jpg"
  }
];

  activeService = this.services[0];

  switchService(index: number){
    this.activeIndex = index;
    this.fadeIn = false;
    this.fadeOut = true;

    setTimeout(() => {
      this.fadeIn =  true;
      this.fadeOut = false;
      this.activeService = this.services[index];
    }, 200)
  }
}
