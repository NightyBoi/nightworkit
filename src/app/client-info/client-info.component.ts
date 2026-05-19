import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';

interface StatCell {
  target: number;
  current: number;
  suffix: string;
  label: string;
  meta: string;
  format: (n: number) => string;
}

@Component({
  selector: 'app-client-info',
  standalone: true,
  imports: [],
  templateUrl: './client-info.component.html',
  styleUrl: './client-info.component.scss'
})
export class ClientInfoComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('statNum') statNums!: QueryList<ElementRef<HTMLElement>>;

  stats: StatCell[] = [];
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    const daysStrong = Math.floor((Date.now() - new Date('2022-09-01').getTime()) / 86400000);

    this.stats = [
      {
        target: daysStrong,
        current: 0,
        suffix: '',
        label: 'Days strong',
        meta: 'Founded Sep 2022',
        format: n => n.toString()
      },
      {
        target: 0,
        current: 0,
        suffix: '',
        label: 'Clients annoyed',
        meta: 'A streak we plan to keep',
        format: n => n.toString()
      },
      {
        target: 242,
        current: 0,
        suffix: '+',
        label: 'Midnight ideas',
        meta: 'The good ones get shipped',
        format: n => n.toString()
      },
      {
        target: 1000000,
        current: 0,
        suffix: '+',
        label: 'Keystrokes typed',
        meta: 'Caffeine consumption: classified',
        format: n => n.toLocaleString('de-DE')
      }
    ];
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt((entry.target as HTMLElement).dataset['idx'] ?? '0', 10);
            this.animateStat(idx);
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    this.statNums.forEach(ref => this.observer!.observe(ref.nativeElement));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private animateStat(idx: number): void {
    const stat = this.stats[idx];
    if (stat.target === 0) { stat.current = 0; return; }

    const duration = 1400;
    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      stat.current = Math.round(eased * stat.target);
      if (t < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }
}
