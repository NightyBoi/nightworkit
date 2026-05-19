import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Service {
  key: string;
  title: string;
  short: string;
  desc1: string;
  desc2: string;
  tags: string[];
  iconPath: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent {
  activeModal: Service | null = null;
  modalVisible = false;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  services: Service[] = [
    {
      key: 'design',
      title: 'Web Design',
      short: 'Layouts that feel as good as they look, and convert.',
      desc1: 'We design sites that actually convert, not award-winning portfolios that confuse the people who need to buy something. Layouts built around what your users are trying to do, not around what looked impressive in the design sprint.',
      desc2: 'One team does the whole thing. No hand-offs between a design agency and a dev shop, no miscommunication in the middle, no extra invoice for "design QA". Brand, layout, mobile, performance: covered.',
      tags: ['UX', 'UI', 'Brand', 'Prototype'],
      iconPath: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
    },
    {
      key: 'code',
      title: 'Web Development',
      short: 'Sites that look polished and run like infrastructure.',
      desc1: 'We build what we design and design what we build. No miscommunication between a wireframe shop and a dev house. The same people who drew it ship it. Front end, back end, database, the whole thing.',
      desc2: 'React, Angular, Node, whatever the project actually needs. We don\'t have a favourite framework we push onto every client. We use what\'s right for the scale, the timeline, and the budget in front of us.',
      tags: ['React', 'Angular', 'Node', 'TypeScript'],
      iconPath: 'M16 18l6-6-6-6M8 6l-6 6 6 6'
    },
    {
      key: 'cart',
      title: 'E-commerce',
      short: 'Stores built around the checkout, not around the homepage.',
      desc1: 'We build stores around the checkout, not the homepage. Every decision (catalogue layout, payment flow, mobile UX) gets weighed against one question: does this make someone more or less likely to complete a purchase?',
      desc2: 'Shopify, headless, or custom. We\'ll scope it honestly and tell you which is overkill for your current stage. No upsells dressed up as best practice. No platform lock-in we benefit from.',
      tags: ['Shopify', 'Headless', 'Payments', 'Analytics'],
      iconPath: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0'
    },
    {
      key: 'shield',
      title: 'Maintenance & Support',
      short: 'Keep what you have fast, secure, and quietly improving.',
      desc1: 'We handle the boring-but-critical stuff so you don\'t have to think about it: security patches, uptime monitoring, performance, and the thing that breaks at 11pm on a Friday.',
      desc2: 'No support ticket queues. No three-day SLA on a fix that takes ten minutes. We work lean, which means you get actual response times, not promises buried in a contract you signed six months ago.',
      tags: ['SLA', 'Monitoring', 'Backups', 'Security'],
      iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'
    },
    {
      key: 'saas',
      title: 'SaaS Development',
      short: 'From zero to paying users, built to scale from day one.',
      desc1: 'We build SaaS products end to end: architecture, billing, auth, dashboards, the works. No cutting corners that you\'ll pay for in six months. No over-engineering a feature set nobody\'s paid for yet.',
      desc2: 'Post-launch we stay close: shipping features, watching metrics, scaling what needs it. We\'ve seen enough early-stage products to know which shortcuts are fine and which ones quietly kill companies.',
      tags: ['Multi-tenant', 'Billing', 'Auth', 'API', 'Dashboards'],
      iconPath: 'M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z'
    },
    {
      key: 'spark',
      title: 'Custom Solutions',
      short: 'Anything else. If it can be coded, we\'ll scope it.',
      desc1: 'If you can describe the problem in plain language, we can scope a build for it. Integrations, automation, internal tools, data pipelines. If software can solve it, we\'ll figure out how.',
      desc2: 'We\'d rather hear "we have this weird problem" than "we need a [trending tech term] solution". Start with the problem. We\'ll work backwards to the right build and tell you honestly if the answer is simpler than you think.',
      tags: ['Integrations', 'Automation', 'R&D'],
      iconPath: 'M5 3l14 9-14 9V3z'
    }
  ];

  openModal(svc: Service): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.activeModal = svc;
    document.body.style.overflow = 'hidden';
    // Defer by one frame so @if renders the DOM in its initial state
    // before .open is applied — otherwise the CSS transition is skipped
    setTimeout(() => { this.modalVisible = true; });
  }

  closeModal(): void {
    this.modalVisible = false;
    this.closeTimer = setTimeout(() => {
      this.activeModal = null;
      document.body.style.overflow = '';
    }, 320);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.modalVisible) this.closeModal(); }
}
